import { Request, Response } from "express";
import BusModel from "../../../../models/bus.model";
import { AuthenticatedRequest } from "../../middleware/rbac.middleware";
import UserModel from "../../../../models/user.model";
import { createAuditLogFromRequest } from "../../../../utils/logger";

const normalizeIntermediateStops = (intermediateStops: any, stops: any) => {
  const parsedStops = Array.isArray(intermediateStops)
    ? intermediateStops
    : typeof intermediateStops === "string"
      ? (() => {
          try {
            const parsed = JSON.parse(intermediateStops);
            return Array.isArray(parsed) ? parsed : [];
          } catch {
            return [];
          }
        })()
      : [];

  const cleanedStops = parsedStops
    .map((stop: any) => ({
      stopName: String(stop?.stopName || stop?.name || "").trim(),
      time: String(stop?.time || "").trim(),
    }))
    .filter((stop: any) => stop.stopName);

  if (cleanedStops.length > 0) {
    return cleanedStops;
  }

  if (Array.isArray(stops)) {
    return stops
      .map((stop: any) => String(stop || "").trim())
      .filter(Boolean)
      .map((stopName: string) => ({ stopName, time: "" }));
  }

  if (typeof stops === "string" && stops.trim()) {
    return stops
      .split(",")
      .map((stop: string) => stop.trim())
      .filter(Boolean)
      .map((stopName: string) => ({ stopName, time: "" }));
  }

  return [];
};

const buildTimings = (departureStopageTime: string | undefined, arrivalStopageTime: string | undefined, timings: any) => {
  if (Array.isArray(timings) && timings.length > 0) {
    return timings;
  }

  if (departureStopageTime || arrivalStopageTime) {
    return [
      {
        departure: departureStopageTime || "",
        arrival: arrivalStopageTime || "",
      },
    ];
  }

  return [];
};

export const createBus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      busName,
      routeName,
      stops,
      timings,
      fare,
      departureStopageTime,
      arrivalStopageTime,
      intermediateStops,
    } =
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
    const normalizedIntermediateStops = normalizeIntermediateStops(intermediateStops, stops);
    const normalizedTimings = buildTimings(departureStopageTime, arrivalStopageTime, timings);
    const newBus = await BusModel.create({
      busName,
      routeName,
      stops: normalizedIntermediateStops.map((stop) => stop.stopName),
      timings: normalizedTimings,
      departureStopageTime: departureStopageTime || null,
      arrivalStopageTime: arrivalStopageTime || null,
      intermediateStops: normalizedIntermediateStops,
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
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const sortOrder = (req.query.sortOrder as string) === 'asc' ? 1 : -1;

    let query: any = {};
    if (search) {
      query.$or = [
        { busName: { $regex: search, $options: "i" } },
        { routeName: { $regex: search, $options: "i" } },
        { stops: { $regex: search, $options: "i" } },
        { "intermediateStops.stopName": { $regex: search, $options: "i" } },
        { departureStopageTime: { $regex: search, $options: "i" } },
        { arrivalStopageTime: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const total = await BusModel.countDocuments(query);
    const buses = await BusModel.find(query)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      data: buses,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
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
      "departureStopageTime",
      "arrivalStopageTime",
      "intermediateStops",
      "fare",
    ];
    const oldData = bus.toObject();

    const normalizedIntermediateStops = normalizeIntermediateStops(updateData.intermediateStops, updateData.stops);
    const normalizedTimings = buildTimings(updateData.departureStopageTime, updateData.arrivalStopageTime, updateData.timings);

    if (normalizedIntermediateStops.length > 0) {
      updateData.intermediateStops = normalizedIntermediateStops;
      updateData.stops = normalizedIntermediateStops.map((stop: any) => stop.stopName);
    }

    if (normalizedTimings.length > 0) {
      updateData.timings = normalizedTimings;
    }

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

