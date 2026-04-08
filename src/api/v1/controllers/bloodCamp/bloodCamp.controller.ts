import { Request, Response } from "express";
import BloodCampModel from "../../../../models/bloodCamp.model";
import { AuthenticatedRequest } from "../../middleware/rbac.middleware";
import { uploadToCloudinary, deleteFromCloudinary } from "../../../../utils/cloudinary.utils";

export const createBloodCamp = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { campName, organizer, date, time, location, address, city, bloodGroupsNeeded, contactPhone, contactEmail, description, status, targetUnits, collectedUnits } = req.body;

    let banner_image = null;
    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer, "blood_camps");
      banner_image = uploadResult.secure_url;
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
      contactPhone,
      contactEmail,
      description,
      status, 
      targetUnits,
      collectedUnits,
      createdBy: req.user?.userId,
    });

    res.status(201).json({
      message: "Blood Donation Camp created successfully",
      camp: newCamp,
    });
  } catch (error: any) {
    console.error("Create Blood Camp Error:", error);
    res.status(500).json({ message: "Failed to create blood camp", error: error.message });
  }
};

export const getBloodCamps = async (req: Request, res: Response) => {
  try {
    const camps = await BloodCampModel.find().sort({ date: 1 });
    res.status(200).json(camps);
  } catch (error: any) {
    console.error("Get Blood Camps Error:", error);
    res.status(500).json({ message: "Failed to fetch blood camps", error: error.message });
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

    if (req.file) {
      // If there's an old image, we might want to delete it, but Cloudinary deletion needs the public_id
      // For now, let's just upload the new one
      const uploadResult = await uploadToCloudinary(req.file.buffer, "blood_camps");
      updateData.banner_image = uploadResult.secure_url;
    }

    if (updateData.bloodGroupsNeeded && typeof updateData.bloodGroupsNeeded === 'string') {
      updateData.bloodGroupsNeeded = JSON.parse(updateData.bloodGroupsNeeded);
    }

    const updatedCamp = await BloodCampModel.findByIdAndUpdate(id, updateData, { new: true });

    res.status(200).json({
      message: "Blood Donation Camp updated successfully",
      camp: updatedCamp,
    });
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

    // Ideally, delete the image from Cloudinary here if it exists.
    // Needs public_id extraction from URL.

    res.status(200).json({
      message: "Blood Donation Camp deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete Blood Camp Error:", error);
    res.status(500).json({ message: "Failed to delete blood camp", error: error.message });
  }
};
