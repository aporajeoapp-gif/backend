import { Request, Response } from "express";
import FerryModel from "../../../../models/ferry.model";
import { AuthenticatedRequest } from "../../middleware/rbac.middleware";
import UserModel from "../../../../models/user.model";
import { createAuditLogFromRequest } from "../../../../utils/logger";

export const createFerry = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { ferryName, routeName, stops, timings, fare } = req.body;
    const createdBy = req.user?.userId;

    if (!createdBy) {
      return res.status(401).json({ message: "Unauthorized: No userId" });
    }

    const user = await UserModel.findById(createdBy);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const creatorName = user.name;
    const newFerry = await FerryModel.create({
      ferryName,
      routeName,
      stops,
      timings,
      fare,
      createdBy,
      creatorName,
    });
    res.status(201).json({ message: "Ferry route created successfully", ferry: newFerry });

    // Audit Log
    await createAuditLogFromRequest(req, {
      action: "FERRY_CREATE",
      task: `Created ferry: ${newFerry.ferryName}`,
      details: `Created ferry route ${newFerry.routeName}`,
      severity: "medium",
      payload: {
        newData: newFerry.toObject(),
      },
      entityId: newFerry._id.toString(),
      entityModel: "FerryRoutes",
    });
  } catch (error: any) {
    console.error("Create Ferry Error:", error);
    res.status(500).json({ message: "Failed to create ferry route", error: error.message });
  }
};

export const getFerries = async (req: Request, res: Response) => {
  try {
    const ferries = await FerryModel.find().sort({ createdAt: -1 });
    res.status(200).json(ferries);
  } catch (error: any) {
    console.error("Get Ferries Error:", error);
    res.status(500).json({ message: "Failed to fetch ferry routes", error: error.message });
  }
};

export const updateFerry = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
      return res.status(400).json({ message: "Missing required fields: id" });
    }

    const ferry = await FerryModel.findById(id);
    if (!ferry) {
      return res.status(404).json({ message: "Ferry route not found" });
    }

    const fieldsToUpdate = [
      "ferryName",
      "routeName",
      "stops",
      "timings",
      "fare",
    ];

    const oldData = ferry.toObject();

    fieldsToUpdate.forEach((field) => {
      if (updateData[field] !== undefined) {
        (ferry as any)[field] = updateData[field];
      }
    });

    await ferry.save();

    res.status(200).json({
      message: "Ferry route updated successfully",
      ferry,
    });

    const modifiedFields = Object.keys(updateData).filter(key => fieldsToUpdate.includes(key));
    const changeDetails = modifiedFields.length > 0 
      ? `Modified fields: ${modifiedFields.join(", ")}` 
      : `Updated ferry details for ${ferry.ferryName}`;

    // Audit Log
    await createAuditLogFromRequest(req, {
      action: "FERRY_UPDATE",
      task: `Updated ferry: ${ferry.ferryName}`,
      details: changeDetails,
      severity: "medium",
      payload: {
        oldData,
        newData: ferry.toObject(),
      },
      entityId: ferry._id.toString(),
      entityModel: "FerryRoutes",
    });
  } catch (error: any) {
    console.error("Update Ferry Error:", error);
    res.status(500).json({ message: "Failed to update ferry route", error: error.message });
  }
};

export const deleteFerry = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Missing required fields: id" });
    }

    const ferry = await FerryModel.findByIdAndDelete(id);
    if (!ferry) {
      return res.status(404).json({ message: "Ferry route not found" });
    }

    res.status(200).json({
      message: "Ferry route deleted successfully",
      ferry,
    });

    // Audit Log
    await createAuditLogFromRequest(req, {
      action: "FERRY_DELETE",
      task: `Deleted ferry: ${ferry.ferryName}`,
      details: `Permanently removed ferry ${ferry.ferryName} from route ${ferry.routeName}`,
      severity: "high",
      payload: {
        oldData: ferry.toObject(),
      },
      entityId: ferry._id.toString(),
      entityModel: "FerryRoutes",
    });
  } catch (error: any) {
    console.error("Delete Ferry Error:", error);
    res.status(500).json({ message: "Failed to delete ferry route", error: error.message });
  }
};

