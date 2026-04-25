import AuditLogModel from "../models/auditLog.model";
import { CreateAuditLogParams, IAuditLog } from "../@types/interfaces/auditLog.interface";
import { Types } from "mongoose";
import { AuthenticatedRequest } from "../api/v1/middleware/rbac.middleware";

const sanitizeData = (data: any, depth = 0): any => {
  if (!data || depth > 5) return data;

  // Handle Mongoose ObjectId
  if (data instanceof Types.ObjectId || data._bsontype === "ObjectId") {
    return data.toString();
  }

  // Handle Dates
  if (
    data instanceof Date ||
    (data && typeof data.toISOString === "function")
  ) {
    return typeof data.toISOString === "function"
      ? data.toISOString()
      : data.toString();
  }

  if (typeof data !== "object") return data;

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeData(item, depth + 1));
  }

  const sanitized: any = {};
  const sensitiveFields = [
    "password",
    "token",
    "accessToken",
    "refreshToken",
    "__v",
  ];

  for (const key in data) {
    const value = data[key];

    if (sensitiveFields.includes(key)) continue;

    // Convert nested ObjectIds
    if (
      value instanceof Types.ObjectId ||
      (value && value._bsontype === "ObjectId")
    ) {
      sanitized[key] = value.toString();
      continue;
    }

    // Convert nested Dates
    if (
      value instanceof Date ||
      (value && typeof value.toISOString === "function")
    ) {
      sanitized[key] =
        typeof value.toISOString === "function"
          ? value.toISOString()
          : value.toString();
      continue;
    }

    // Remove other binary buffers that aren't IDs
    if (Buffer.isBuffer(value) || (value && value.type === "Buffer")) {
      continue;
    }

    if (value && typeof value === "object") {
      sanitized[key] = sanitizeData(value, depth + 1);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};

const getDeviceName = (userAgent: string): string => {
  if (!userAgent) return "Unknown Device";
  if (userAgent.includes("Mobi")) return "Mobile Device";
  if (userAgent.includes("Tablet")) return "Tablet Device";
  return "Desktop";
};

export const createAuditLog = async (params: CreateAuditLogParams) => {

  try {
    const auditLogData: Partial<IAuditLog> = {
      user: new Types.ObjectId(params.user.id),
      userName: params.user.name || "Unknown User",
      userEmail: params.user.email || "unknown@system.com",
      userRole: params.user.role || "unknown",
      action: params.action,
      task: params.task,
      details: params.details,
      severity: params.severity || "medium",
      payload: {
        oldData: params.payload?.oldData
          ? sanitizeData(params.payload.oldData)
          : null,
        newData: params.payload?.newData
          ? sanitizeData(params.payload.newData)
          : null,
      },
      entityId: params.entityId
        ? new Types.ObjectId(params.entityId)
        : undefined,
      entityModel: params.entityModel || undefined,
      ipAddress: params.ipAddress || "unknown",
      userAgent: params.userAgent || "unknown",
      deviceName: params.deviceName || (params.userAgent ? getDeviceName(params.userAgent) : "Unknown Device"),
      location: params.location || undefined,
    };



    const newLog = await AuditLogModel.create(auditLogData);
    return newLog;
  } catch (error) {
    console.error("Failed to create audit log:", error);
    return null;
  }
};


export const createAuditLogFromRequest = async (

  req: AuthenticatedRequest,
  params: Omit<CreateAuditLogParams, "user" | "ipAddress" | "userAgent">,
) => {
  if (!req.user) return null;

  const userAgent = req.headers["user-agent"] || "unknown";
  
  // Extract location from headers if provided by frontend
  const lat = req.headers["x-latitude"] ? parseFloat(req.headers["x-latitude"] as string) : undefined;
  const lng = req.headers["x-longitude"] ? parseFloat(req.headers["x-longitude"] as string) : undefined;

  return createAuditLog({
    ...params,
    user: {
      id: req.user.userId,
      name: req.user.name,
      role: req.user.role,
      email: req.user.email,
    },
    ipAddress: req.ip,
    userAgent,
    deviceName: getDeviceName(userAgent),
    location: (lat && lng) ? { lat, lng } : undefined,
  });
};

