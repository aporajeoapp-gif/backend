import { Request, Response } from "express";
import DonorModel from "../../../../models/donor.model";
import BloodCampModel from "../../../../models/bloodCamp.model";
import { AuthenticatedRequest } from "../../middleware/rbac.middleware";
import { createAuditLogFromRequest } from "../../../../services/auditLog.service";

export const addDonorToCamp = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { campId, name, bloodGroup, age, phone, donatedAt } = req.body;
    console.log("Adding donor to camp:", campId, { name, bloodGroup, age, phone });

    if (!campId || !name || !bloodGroup || !age || !phone) {
      console.log("Validation failed: missing fields");
      return res.status(400).json({ message: "All fields are required" });
    }

    const camp = await BloodCampModel.findById(campId);
    if (!camp) {
      return res.status(404).json({ message: "Blood Donation Camp not found" });
    }

    const newDonor = await DonorModel.create({
      campId,
      name,
      bloodGroup,
      age,
      phone,
      donatedAt: donatedAt || new Date(),
    });

    // Optionally increment collected units in the camp
    await BloodCampModel.findByIdAndUpdate(campId, {
      $inc: { collectedUnits: 1 }
    });

    res.status(201).json({
      message: "Donor added successfully",
      donor: newDonor,
    });

    // Audit Log
    await createAuditLogFromRequest(req, {
      action: "DONOR_ADD",
      task: `Added donor: ${newDonor.name}`,
      details: `Added donor to camp: ${camp.campName}`,
      severity: "medium",
      payload: { newData: newDonor.toObject() },
      entityId: newDonor._id.toString(),
      entityModel: "Donors",
    });
  } catch (error: any) {
    console.error("Add Donor Error:", error);
    res.status(500).json({ message: "Failed to add donor", error: error.message });
  }
};

export const getCampDonors = async (req: Request, res: Response) => {
  try {
    const { campId } = req.params;

    const donors = await DonorModel.find({ campId }).sort({ createdAt: -1 });
    res.status(200).json(donors);
  } catch (error: any) {
    console.error("Get Camp Donors Error:", error);
    res.status(500).json({ message: "Failed to fetch donors", error: error.message });
  }
};

export const deleteDonor = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const donor = await DonorModel.findById(id);
    if (!donor) {
      return res.status(404).json({ message: "Donor not found" });
    }

    await DonorModel.findByIdAndDelete(id);

    // Decrement collected units in the camp
    await BloodCampModel.findByIdAndUpdate(donor.campId, {
      $inc: { collectedUnits: -1 }
    });

    res.status(200).json({
      message: "Donor deleted successfully",
    });

    // Audit Log
    await createAuditLogFromRequest(req, {
      action: "DONOR_DELETE",
      task: `Deleted donor: ${donor.name}`,
      details: `Deleted donor from camp ID: ${donor.campId}`,
      severity: "high",
      payload: { oldData: donor.toObject() },
      entityId: donor._id.toString(),
      entityModel: "Donors",
    });
  } catch (error: any) {
    console.error("Delete Donor Error:", error);
    res.status(500).json({ message: "Failed to delete donor", error: error.message });
  }
};


