import { Request, Response } from "express";
import DonorModel from "../../../../models/donor.model";
import BloodCampModel from "../../../../models/bloodCamp.model";
import { AuthenticatedRequest } from "../../middleware/rbac.middleware";
import { createAuditLogFromRequest } from "../../../../services/auditLog.service";

export const addDonorToCamp = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { campId, name, bloodGroup, age, phone, donatedAt } = req.body;
    console.log("Adding donor to camp (Admin):", campId, { name, bloodGroup, age, phone });

    if (!campId || !name || !bloodGroup || !age || !phone) {
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
      status: "approved",
      approvedBy: req.user?.userId,
      expiresAt: null
    });

    // Increment collected units in the camp (only for approved)
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

export const publicDonorRegistration = async (req: Request, res: Response) => {
  try {
    const { campId, name, bloodGroup, age, phone } = req.body;
    console.log("Public Donor Registration:", campId, { name, bloodGroup, age, phone });

    if (!campId || !name || !bloodGroup || !age || !phone) {
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
      donatedAt: null, // Public doesn't set donation time yet
      status: "pending",
      approvedBy: null,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
    });

    // NOTE: We DON'T increment collectedUnits here. It happens on approval.

    res.status(201).json({
      message: "Registration successful! Your data is waiting for admin approval.",
      donor: newDonor,
    });
  } catch (error: any) {
    console.error("Public Donor Reg Error:", error);
    res.status(500).json({ message: "Failed to register donor", error: error.message });
  }
};

export const approveDonor = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const donor = await DonorModel.findById(id);

    if (!donor) {
      return res.status(404).json({ message: "Donor not found" });
    }

    if (donor.status === "approved") {
      return res.status(400).json({ message: "Donor is already approved" });
    }

    donor.status = "approved";
    donor.approvedBy = (req as any).user.userId;
    donor.expiresAt = null; // Remove TTL
    donor.donatedAt = new Date(); // Mark as donated now since approved

    await donor.save();

    // Increment collected units in the camp
    await BloodCampModel.findByIdAndUpdate(donor.campId, {
      $inc: { collectedUnits: 1 }
    });

    res.status(200).json({ message: "Donor approved successfully", donor });

    // Audit Log
    await createAuditLogFromRequest(req, {
      action: "DONOR_APPROVE",
      task: `Approved donor: ${donor.name}`,
      details: `Approved donor for camp ID: ${donor.campId}`,
      severity: "medium",
      payload: { newData: { donorId: donor._id } },
      entityId: donor._id.toString(),
      entityModel: "Donors",
    });
  } catch (error: any) {
    console.error("Approve Donor Error:", error);
    res.status(500).json({ message: "Failed to approve donor", error: error.message });
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

    const wasApproved = donor.status === "approved";

    await DonorModel.findByIdAndDelete(id);

    // Only decrement collected units if the donor was approved
    if (wasApproved) {
      await BloodCampModel.findByIdAndUpdate(donor.campId, {
        $inc: { collectedUnits: -1 }
      });
    }

    res.status(200).json({
      message: "Donor deleted successfully",
    });

    // Audit Log
    await createAuditLogFromRequest(req, {
      action: "DONOR_DELETE",
      task: `Deleted donor: ${donor.name}`,
      details: `Deleted donor from camp ID: ${donor.campId}, Status was: ${donor.status}`,
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


