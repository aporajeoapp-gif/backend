import { Response,Request } from "express";
import { AuthenticatedRequest } from "../../middleware/rbac.middleware";
import UserModel from "../../../../models/user.model";
import EmergencyModel from "../../../../models/emergency.model";
import { createAuditLogFromRequest } from "../../../../utils/logger";

export const createEmergencyService = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const { serviceName, category, address, contactPhone, location } = req.body;
    const createdBy = req.user?.userId;

    if (!createdBy) {
      return res.status(401).json({ message: "Unauthorized: No userId" });
    }

    const user = await UserModel.findById(createdBy);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const creatorName = user.name;
    const newEmergencyService = await EmergencyModel.create({
      serviceName,
      category,
      address,
      contactPhone,
      location,
      createdBy,
      creatorName,
    });

    res.status(201).json({
      message: "Emergency service created successfully",
      emergencyService: newEmergencyService,
    });

    // Audit Log
    await createAuditLogFromRequest(req, {
      action: "EMERGENCY_CREATE",
      task: `Created emergency service: ${newEmergencyService.serviceName}`,
      details: `Created emergency service in category ${newEmergencyService.category}`,
      severity: "medium",
      payload: { newData: newEmergencyService.toObject() },
      entityId: newEmergencyService._id.toString(),
      entityModel: "EmergencyServices",
    });
  } catch (error: any) {
    console.error("Create Emergency Service Error:", error);
    res
      .status(500)
      .json({
        message: "Failed to create emergency service",
        error: error.message,
      });
  }
};

export const getEmergencyServices = async (req: Request, res: Response) => {
  try {
    const emergencyServices = await EmergencyModel.find().sort({
      createdAt: -1,
    });
    res.status(200).json(emergencyServices);
  } catch (error: any) {
    console.error("Get Emergency Services Error:", error);
    res
      .status(500)
      .json({
        message: "Failed to fetch emergency services",
        error: error.message,
      });
  }
};

export const updateEmergencyService = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
      return res.status(400).json({ message: "Missing required fields: id" });
    }

    const emergencyService = await EmergencyModel.findById(id);
    if (!emergencyService) {
      return res.status(404).json({ message: "Emergency service not found" });
    }

    const oldData = emergencyService.toObject();

    const fieldsToUpdate = [
      "serviceName",
      "category",
      "address",
      "contactPhone",
      "location",
    ];
    fieldsToUpdate.forEach((field) => {
      if (updateData[field] !== undefined) {
        (emergencyService as any)[field] = updateData[field];
      }
    });

    await emergencyService.save();

    res.status(200).json({
      message: "Emergency service updated successfully",
      emergencyService,
    });

    // Audit Log
    await createAuditLogFromRequest(req, {
      action: "EMERGENCY_UPDATE",
      task: `Updated emergency service: ${emergencyService.serviceName}`,
      details: `Updated details for emergency service ${emergencyService.serviceName}`,
      severity: "medium",
      payload: { oldData, newData: emergencyService.toObject() },
      entityId: emergencyService._id.toString(),
      entityModel: "EmergencyServices",
    });
  } catch (error: any) {
    console.error("Update Emergency Service Error:", error);
    res
      .status(500)
      .json({
        message: "Failed to update emergency service",
        error: error.message,
      });
  }
};

export const deleteEmergencyService = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Missing required fields: id" });
    }

    const emergencyService = await EmergencyModel.findByIdAndDelete(id);
    if (!emergencyService) {
      return res.status(404).json({ message: "Emergency service not found" });
    }

    res.status(200).json({
      message: "Emergency service deleted successfully",
      emergencyService,
    });

    // Audit Log
    await createAuditLogFromRequest(req, {
      action: "EMERGENCY_DELETE",
      task: `Deleted emergency service: ${emergencyService.serviceName}`,
      details: `Permanently removed emergency service ${emergencyService.serviceName}`,
      severity: "high",
      payload: { oldData: emergencyService.toObject() },
      entityId: emergencyService._id.toString(),
      entityModel: "EmergencyServices",
    });
  } catch (error: any) {
    console.error("Delete Emergency Service Error:", error);
    res
      .status(500)
      .json({
        message: "Failed to delete emergency service",
        error: error.message,
      });
  }
};

