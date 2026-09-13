import { Request, Response } from "express";
import DoctorModel from "../../../../models/doctor.model";
import { AuthenticatedRequest } from "../../middleware/rbac.middleware";
import UserModel from "../../../../models/user.model";
import { createAuditLogFromRequest } from "../../../../utils/logger";
import { IDoctorSchedule } from "../../../../@types/interfaces/doctor.interface";

const normalizeSchedule = (
  schedule?: IDoctorSchedule[] | IDoctorSchedule | string
) => {
  let parsedSchedule: IDoctorSchedule[] = [];

  // Handle form-data/string payloads from frontend (e.g. JSON string).
  if (typeof schedule === "string") {
    try {
      const parsed = JSON.parse(schedule);
      if (Array.isArray(parsed)) {
        parsedSchedule = parsed;
      } else if (parsed && typeof parsed === "object") {
        parsedSchedule = [parsed as IDoctorSchedule];
      } else {
        return [];
      }
    } catch {
      return [];
    }
  } else if (Array.isArray(schedule)) {
    parsedSchedule = schedule;
  } else if (schedule && typeof schedule === "object") {
    // Handle single object payloads.
    parsedSchedule = [schedule];
  } else {
    return [];
  }

  return parsedSchedule
    .map((item) => ({
      day: item?.day?.trim() || undefined,
      time: item?.time?.trim() || undefined,
      chamber: item?.chamber?.trim() || undefined,
    }))
    .filter((item) => item.day || item.time || item.chamber);
};

const normalizePhone = (value: unknown) => {
  const phone = String(value ?? "").trim();
  return phone || null;
};

const normalizeLocation = (value: any) => {
  if (!value || typeof value !== "object") return null;

  const address = String(value.address ?? "").trim();
  const latitude = Number(value.latitude);
  const longitude = Number(value.longitude);

  return {
    address: address || null,
    latitude: Number.isFinite(latitude) ? latitude : null,
    longitude: Number.isFinite(longitude) ? longitude : null,
  };
};

export const createDoctor = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const {
      name,
      specialty,
      personalNo,
      location,
      phone,
      alternatePhone: alternatePhoneValue,
      degree,
      experience,
      medicalShopLocation,
      email,
      schedule,
    } = req.body;
    const alternatePhone = normalizePhone(
      alternatePhoneValue ?? req.body.alternatePhNo ?? req.body.alternatePhoneNo,
    );
    const createdBy = req.user?.userId;

    if (!createdBy) {
      return res.status(401).json({ message: "Unauthorized: No userId" });
    }

    const user = await UserModel.findById(createdBy);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const creatorName = user.name;
    const normalizedSchedule = normalizeSchedule(schedule);

    const newDoctor = await DoctorModel.create({
      name,
      specialty,
      personalNo,
      location,
      phone,
      alternatePhone,
      degree: String(degree ?? "").trim() || null,
      experience: experience === "" || experience === undefined || experience === null ? null : Number(experience),
      medicalShopLocation: normalizeLocation(medicalShopLocation),
      email,
      schedule: normalizedSchedule,
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
    if (error?.name === "ValidationError" || error?.message?.includes("schedule item")) {
      return res.status(400).json({ message: error.message });
    }
    res
      .status(500)
      .json({ message: "Failed to create doctor", error: error.message });
  }
};

export const getDoctors = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const sortOrder = (req.query.sortOrder as string) === 'asc' ? 1 : -1;

    let query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { specialty: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const total = await DoctorModel.countDocuments(query);
    const doctors = await DoctorModel.find(query)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      data: doctors,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
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
    if (updateData.alternatePhone === undefined) {
      updateData.alternatePhone =
        updateData.alternatePhNo ?? updateData.alternatePhoneNo;
    }
    if (updateData.medicalShopLocation !== undefined) {
      updateData.medicalShopLocation = normalizeLocation(updateData.medicalShopLocation);
    }
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
      "personalNo",
      "location",
      "phone",
      "alternatePhone",
      "degree",
      "experience",
      "medicalShopLocation",
      "email",
      "schedule",
      "image",
    ];
    
    fieldsToUpdate.forEach((field) => {
      if (updateData[field] !== undefined) {
        if (field === "schedule") {
          (doctor as any)[field] = normalizeSchedule(updateData.schedule);
        } else {
          (doctor as any)[field] =
            field === "alternatePhone"
              ? normalizePhone(updateData[field])
              : field === "degree"
                ? String(updateData[field] ?? "").trim() || null
                : field === "experience"
                  ? updateData[field] === "" || updateData[field] === null
                    ? null
                    : Number(updateData[field])
              : updateData[field];
        }
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
    if (error?.name === "ValidationError" || error?.message?.includes("schedule item")) {
      return res.status(400).json({ message: error.message });
    }
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
