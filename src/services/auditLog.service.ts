import AuditLogModel from "../models/auditLog.model";
import { IAuditLog } from "../@types/interfaces/auditLog.interface";
import { Types } from "mongoose";

export interface CreateAuditLogParams {
  user: {
    id: string;
    name?: string;
    role?: string;
    email?: string;
  };
  action: string;
  task: string;
  details: string;
  severity?: "low" | "medium" | "high";
  payload?: {
    oldData?: any;
    newData?: any;
  };
  entityId?: string;
  entityModel?: string;
  ipAddress?: string;
  userAgent?: string;
}


const sanitizeData = (data: any): any => {
  if (!data) return data;

  // Handle Mongoose ObjectId
  if (data instanceof Types.ObjectId || (data._bsontype === "ObjectId")) {
    return data.toString();
  }

  // Handle Dates
  if (data instanceof Date || (data && typeof data.toISOString === "function")) {
    return typeof data.toISOString === "function" ? data.toISOString() : data.toString();
  }

  if (typeof data !== "object") return data;

  if (Array.isArray(data)) {
    return data.map(sanitizeData);
  }

  const sanitized: any = { ...data };
  const sensitiveFields = ["password", "token", "accessToken", "refreshToken", "__v"];

  for (const key in sanitized) {
    const value = sanitized[key];
    
    if (sensitiveFields.includes(key)) {
      delete sanitized[key];
      continue;
    }

    // Convert nested ObjectIds
    if (value instanceof Types.ObjectId || (value && value._bsontype === "ObjectId")) {
      sanitized[key] = value.toString();
      continue;
    }

    // Convert nested Dates
    if (value instanceof Date || (value && typeof value.toISOString === "function")) {
      sanitized[key] = typeof value.toISOString === "function" ? value.toISOString() : value.toString();
      continue;
    }

    // Remove other binary buffers that aren't IDs
    if (Buffer.isBuffer(value) || (value && value.type === "Buffer")) {
      delete sanitized[key];
      continue;
    }

    if (value && typeof value === "object") {
      sanitized[key] = sanitizeData(value);
    }
  }

  return sanitized;
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
        oldData: params.payload?.oldData ? sanitizeData(params.payload.oldData) : null,
        newData: params.payload?.newData ? sanitizeData(params.payload.newData) : null,
      },
      entityId: params.entityId ? new Types.ObjectId(params.entityId) : undefined,
      entityModel: params.entityModel || undefined,
      ipAddress: params.ipAddress || "unknown",
      userAgent: params.userAgent || "unknown",
    };

    const newLog = await AuditLogModel.create(auditLogData);
    return newLog;
  } catch (error) {
    console.error("Failed to create audit log:", error);
    return null;
  }
};
