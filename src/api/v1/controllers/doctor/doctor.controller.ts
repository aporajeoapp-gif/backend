import { Request, Response } from "express";
import DoctorModel from "../../../../models/doctor.model";
import { AuthenticatedRequest } from "../../middleware/rbac.middleware";
import UserModel from "../../../../models/user.model";
import { createAuditLogFromRequest } from "../../../../services/auditLog.service";

export const createDoctor = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const { name, specialty, experience, location, phone, email, schedule } =
      req.body;

    const createdBy = req.user?.userId;

    if (!createdBy) {
      return res.status(401).json({ message: "Unauthorized: No userId" });
    }

    const user = await UserModel.findById(createdBy);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const creatorName = user.name;
    const newDoctor = await DoctorModel.create({
      name,
      specialty,
      experience,
      location,
      phone,
      email,
      schedule,
      image: null,
      createdBy,
      creatorName,
    });

    res.status(201).json({
      message: "Doctor created successfully",
      doctor: newDoctor,
    });

    // Audit Log
    await createAuditLogFromRequest(req, {
      action: "DOCTOR_CREATE",
      task: `Created doctor: ${newDoctor.name}`,
      details: `Created doctor entry for ${newDoctor.specialty} at ${newDoctor.location}`,
      severity: "medium",
      payload: { newData: newDoctor.toObject() },
      entityId: newDoctor._id.toString(),
      entityModel: "Doctors",
    });
  } catch (error: any) {
    console.error("Create Doctor Error:", error);
    res
      .status(500)
      .json({ message: "Failed to create doctor", error: error.message });
  }
};

export const getDoctors = async (req: Request, res: Response) => {
  try {
    const doctors = await DoctorModel.find().sort({ createdAt: -1 });
    res.status(200).json(doctors);
  } catch (error: any) {
    console.error("Get Doctors Error:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch doctors", error: error.message });
  }
};

export const updateDoctor = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
      return res.status(400).json({ message: "Missing required fields: id" });
    }

    const doctor = await DoctorModel.findById(id);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const oldData = doctor.toObject();

    const fieldsToUpdate = [
      "name",
      "specialty",
      "experience",
      "location",
      "phone",
      "email",
      "schedule",
      "image",
    ];
    fieldsToUpdate.forEach((field) => {
      if (updateData[field] !== undefined) {
        (doctor as any)[field] = updateData[field];
      }
    });

    await doctor.save();

    res.status(200).json({
      message: "Doctor updated successfully",
      doctor,
    });

    // Audit Log
    await createAuditLogFromRequest(req, {
      action: "DOCTOR_UPDATE",
      task: `Updated doctor: ${doctor.name}`,
      details: `Updated details for doctor ${doctor.name}`,
      severity: "medium",
      payload: { oldData, newData: doctor.toObject() },
      entityId: doctor._id.toString(),
      entityModel: "Doctors",
    });
  } catch (error: any) {
    console.error("Update Doctor Error:", error);
    res
      .status(500)
      .json({ message: "Failed to update doctor", error: error.message });
  }
};

export const deleteDoctor = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Missing required fields: id" });
    }

    const doctor = await DoctorModel.findByIdAndDelete(id);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.status(200).json({
      message: "Doctor deleted successfully",
      doctor,
    });

    // Audit Log
    await createAuditLogFromRequest(req, {
      action: "DOCTOR_DELETE",
      task: `Deleted doctor: ${doctor.name}`,
      details: `Permanently removed doctor entry for ${doctor.name}`,
      severity: "high",
      payload: { oldData: doctor.toObject() },
      entityId: doctor._id.toString(),
      entityModel: "Doctors",
    });
  } catch (error: any) {
    console.error("Delete Doctor Error:", error);
    res
      .status(500)
      .json({ message: "Failed to delete doctor", error: error.message });
  }
};

