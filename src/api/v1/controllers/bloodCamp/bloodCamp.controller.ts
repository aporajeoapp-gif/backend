import { Request, Response } from "express";
import BloodCampModel from "../../../../models/bloodCamp.model";
import DonorModel from "../../../../models/donor.model";
import { AuthenticatedRequest } from "../../middleware/rbac.middleware";
import { uploadToS3, deleteFromS3 } from "../../../../utils/s3.utils";
import { createAuditLogFromRequest } from "../../../../utils/logger";

export const createBloodCamp = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { campName, organizer, date, time, location, address, city, bloodGroupsNeeded, contactPhone, contactEmail, description, status, targetUnits, collectedUnits } = req.body;

    let banner_image = null;
    let organizationLogo = null;
    
    if (req.files && typeof req.files === 'object') {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      
      if (files['banner'] && files['banner'][0]) {
        const uploadResult = await uploadToS3(
          files['banner'][0].buffer,
          "blood_camps",
          files['banner'][0].originalname,
          files['banner'][0].mimetype
        );
        banner_image = uploadResult.secure_url;
      }
      
      if (files['organizationLogo'] && files['organizationLogo'][0]) {
        const uploadResult = await uploadToS3(
          files['organizationLogo'][0].buffer,
          "blood_camps_logos",
          files['organizationLogo'][0].originalname,
          files['organizationLogo'][0].mimetype
        );
        organizationLogo = uploadResult.secure_url;
      }
    }

    const newCamp = await BloodCampModel.create({
      campName,
      organizer,
      date,
      time,
      location,
      address,
      city,
      bloodGroupsNeeded: typeof bloodGroupsNeeded === 'string' ? JSON.parse(bloodGroupsNeeded) : bloodGroupsNeeded,
      banner_image,
      organizationLogo,
      contactPhone,
      contactEmail,
      description,
      status: status || "upcoming", 
      targetUnits,
      collectedUnits,
      createdBy: req.user?.userId,
    });

    res.status(201).json({
      message: "Blood Donation Camp created successfully",
      camp: newCamp,
    });

    // Audit Log
    await createAuditLogFromRequest(req, {
      action: "BLOOD_CAMP_CREATE",
      task: `Created blood camp: ${newCamp.campName}`,
      details: `Created blood camp at ${newCamp.location}`,
      severity: "medium",
      payload: { newData: newCamp.toObject() },
      entityId: newCamp._id.toString(),
      entityModel: "BloodCamps",
    });
  } catch (error: any) {
    console.error("Create Blood Camp Error:", error);
    res.status(500).json({ message: "Failed to create blood camp", error: error.message });
  }
};

export const getBloodCamps = async (req: Request, res: Response) => {
  try {
    const query: any = {};
    // If no authorization header, only show published camps (Public View)
    if (!req.headers.authorization) {
      query.isPublished = true;
    }
    
    const camps = await BloodCampModel.find(query).sort({ date: 1 });
    
    // Auto update status logic based on date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    const updatedCampsPromises = camps.map(async (camp) => {
      let newStatus = camp.status;
      const campDateStr = new Date(camp.date).toISOString().split('T')[0];

      if (campDateStr < todayStr) {
        newStatus = 'completed';
      } else if (campDateStr === todayStr) {
        newStatus = 'ongoing';
      }
      // If it's in the future and status isn't manually changed from upcoming, stay upcoming
      // But user says: "bydefault will be upcoming... after complete auto update completed"
      // So we mainly care about auto-transitioning to ongoing/completed.

      if (newStatus !== camp.status) {
        camp.status = newStatus as any;
        await camp.save();
      }
      return camp;
    });

    const result = await Promise.all(updatedCampsPromises);
    res.status(200).json(result);
  } catch (error: any) {
    console.error("Get Blood Camps Error:", error);
    res.status(500).json({ message: "Failed to fetch blood camps", error: error.message });
  }
};

export const getBloodCampById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const camp = await BloodCampModel.findById(id);
    if (!camp) {
      return res.status(404).json({ message: "Blood Donation Camp not found" });
    }

    // Fetch approved donors for this camp to show in public preview if published
    let donors: any[] = [];
    if (camp.isPublished) {
      donors = await DonorModel.find({ campId: id, status: 'approved' }).sort({ createdAt: -1 });
    }

    res.status(200).json({
      ...camp.toObject(),
      donors: donors
    });
  } catch (error: any) {
    console.error("Get Blood Camp By Id Error:", error);
    res.status(500).json({ message: "Failed to fetch blood camp", error: error.message });
  }
};

export const updateBloodCamp = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const camp = await BloodCampModel.findById(id);
    if (!camp) {
      return res.status(404).json({ message: "Blood Donation Camp not found" });
    }

    const oldData = camp.toObject();

    if (req.files && typeof req.files === 'object') {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      
      if (files['banner'] && files['banner'][0]) {
        if (camp.banner_image) {
          await deleteFromS3(camp.banner_image);
        }
        const uploadResult = await uploadToS3(
          files['banner'][0].buffer,
          "blood_camps",
          files['banner'][0].originalname,
          files['banner'][0].mimetype
        );
        updateData.banner_image = uploadResult.secure_url;
      }
      
      if (files['organizationLogo'] && files['organizationLogo'][0]) {
        if (camp.organizationLogo) {
          await deleteFromS3(camp.organizationLogo);
        }
        const uploadResult = await uploadToS3(
          files['organizationLogo'][0].buffer,
          "blood_camps_logos",
          files['organizationLogo'][0].originalname,
          files['organizationLogo'][0].mimetype
        );
        updateData.organizationLogo = uploadResult.secure_url;
      }
    }

    if (updateData.bloodGroupsNeeded && typeof updateData.bloodGroupsNeeded === 'string') {
      updateData.bloodGroupsNeeded = JSON.parse(updateData.bloodGroupsNeeded);
    }

    const updatedCamp = await BloodCampModel.findByIdAndUpdate(id, updateData, { new: true });

    res.status(200).json({
      message: "Blood Donation Camp updated successfully",
      camp: updatedCamp,
    });

    // Audit Log
    if (updatedCamp) {
      await createAuditLogFromRequest(req, {
        action: "BLOOD_CAMP_UPDATE",
        task: `Updated blood camp: ${updatedCamp.campName}`,
        details: `Updated details for blood camp`,
        severity: "medium",
        payload: { oldData, newData: updatedCamp.toObject() },
        entityId: updatedCamp._id.toString(),
        entityModel: "BloodCamps",
      });
    }

  } catch (error: any) {
    console.error("Update Blood Camp Error:", error);
    res.status(500).json({ message: "Failed to update blood camp", error: error.message });
  }
};

export const deleteBloodCamp = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const camp = await BloodCampModel.findByIdAndDelete(id);
    if (!camp) {
      return res.status(404).json({ message: "Blood Donation Camp not found" });
    }

    // Delete images from S3 if they exist
    if (camp.banner_image) {
      await deleteFromS3(camp.banner_image);
    }
    if (camp.organizationLogo) {
      await deleteFromS3(camp.organizationLogo);
    }

    res.status(200).json({
      message: "Blood Donation Camp deleted successfully",
    });

    // Audit Log
    await createAuditLogFromRequest(req, {
      action: "BLOOD_CAMP_DELETE",
      task: `Deleted blood camp: ${camp.campName}`,
      details: `Deleted blood camp with location ${camp.location}`,
      severity: "high",
      payload: { oldData: camp.toObject() },
      entityId: camp._id.toString(),
      entityModel: "BloodCamps",
    });
  } catch (error: any) {
    console.error("Delete Blood Camp Error:", error);
    res.status(500).json({ message: "Failed to delete blood camp", error: error.message });
  }
};


