import { Request, Response } from "express";
import BusModel from "../../../../models/bus.model";
import { AuthenticatedRequest } from "../../middleware/rbac.middleware";
import UserModel from "../../../../models/user.model";
import { createAuditLogFromRequest } from "../../../../services/auditLog.service";

export const createBus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { busName, routeName, stops, timings, fare } =
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
    const newBus = await BusModel.create({
      busName,
      routeName,
      stops,
      timings,
      fare,
      createdBy,
      creatorName,
    });
    res.status(201).json({ message: "Bus created successfully", bus: newBus });

    // Audit Log
    await createAuditLogFromRequest(req, {
      action: "BUS_CREATE",
      task: `Created bus: ${newBus.busName}`,
      details: `Created bus on route ${newBus.routeName}`,
      severity: "medium",
      payload: {
        newData: newBus.toObject(),
      },
      entityId: newBus._id.toString(),
      entityModel: "BusRoutes",
    });
  } catch (error: any) {
    console.error("Create Bus Error:", error);
    res
      .status(500)
      .json({ message: "Failed to create bus", error: error.message });
  }
};

export const getBuses = async (req: Request, res: Response) => {
  try {
    const buses = await BusModel.find().sort({ createdAt: -1 });
    res.status(200).json(buses);
  } catch (error: any) {
    console.error("Get Buses Error:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch buses", error: error.message });
  }
};

export const updateBus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
      return res.status(400).json({ message: "Missing required fields: id" });
    }

    const bus = await BusModel.findById(id);
    if (!bus) {
      return res.status(404).json({ message: "Bus not found" });
    }

    const fieldsToUpdate = [
      "busName",
      "routeName",
      "stops",
      "timings",
      "fare",
    ];
    const oldData = bus.toObject();

    fieldsToUpdate.forEach((field) => {
      if (updateData[field] !== undefined) {
        (bus as any)[field] = updateData[field];
      }
    });

    await bus.save();

    res.status(200).json({
      message: "Bus updated successfully",
      bus,
    });

    const modifiedFields = Object.keys(updateData).filter(key => fieldsToUpdate.includes(key));
    const changeDetails = modifiedFields.length > 0 
      ? `Modified fields: ${modifiedFields.join(", ")}` 
      : `Updated bus details for ${bus.busName}`;

    // Audit Log
    await createAuditLogFromRequest(req, {
      action: "BUS_UPDATE",
      task: `Updated bus: ${bus.busName}`,
      details: changeDetails,
      severity: "medium",
      payload: {
        oldData,
        newData: bus.toObject(),
      },
      entityId: bus._id.toString(),
      entityModel: "BusRoutes",
    });
  } catch (error: any) {
    console.error("Update Bus Error:", error);
    res
      .status(500)
      .json({ message: "Failed to update bus", error: error.message });
  }
};

export const deleteBus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Missing required fields: id" });
    }

    const bus = await BusModel.findByIdAndDelete(id);
    if (!bus) {
      return res.status(404).json({ message: "Bus not found" });
    }

    res.status(200).json({
      message: "Bus deleted successfully",
      bus,
    });

    // Audit Log
    await createAuditLogFromRequest(req, {
      action: "BUS_DELETE",
      task: `Deleted bus: ${bus.busName}`,
      details: `Permanently removed bus ${bus.busName} from route ${bus.routeName}`,
      severity: "high",
      payload: {
        oldData: bus.toObject(),
      },
      entityId: bus._id.toString(),
      entityModel: "BusRoutes",
    });
  } catch (error: any) {
    console.error("Delete Bus Error:", error);
    res
      .status(500)
      .json({ message: "Failed to delete bus", error: error.message });
  }
};

