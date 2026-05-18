import pino from "pino";
import AuditLogModel from "../models/auditLog.model";

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport: process.env.NODE_ENV !== "production" ? {
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "SYS:standard",
      ignore: "pid,hostname",
    }
  } : undefined
});

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
  deviceName?: string;
  location?: {
    lat?: number;
    lng?: number;
  };
}

// A lightweight, Pino-backed replacement for createAuditLog
export const createAuditLog = async (params: CreateAuditLogParams) => {
  logger.info({
    type: "audit",
    user: params.user,
    action: params.action,
    task: params.task,
    details: params.details,
    severity: params.severity || "medium",
    payload: params.payload,
    entityId: params.entityId,
    entityModel: params.entityModel,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    deviceName: params.deviceName,
    location: params.location,
  }, `[AuditLog - ${params.action}] ${params.task}`);

  // Asynchronously save to database so the frontend can read it!
  AuditLogModel.create({
    user: params.user.id !== "anonymous" ? params.user.id : undefined,
    userName: params.user.name || "Anonymous",
    userEmail: params.user.email || "anonymous",
    userRole: params.user.role || "none",
    action: params.action,
    task: params.task,
    details: params.details,
    severity: params.severity || "medium",
    payload: params.payload,
    entityId: params.entityId,
    entityModel: params.entityModel,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    deviceName: params.deviceName,
    location: params.location,
  }).catch(err => {
    logger.error({ err }, "Failed to save audit log to MongoDB");
  });

  return null;
};

// A lightweight, Pino-backed replacement for createAuditLogFromRequest
export const createAuditLogFromRequest = async (req: any, params: Omit<CreateAuditLogParams, "user" | "ipAddress" | "userAgent" | "deviceName">) => {
  const userAgent = req.headers["user-agent"] || "unknown";
  
  return createAuditLog({
    ...params,
    user: req.user ? {
      id: req.user.userId,
      name: req.user.name,
      role: req.user.role,
      email: req.user.email,
    } : { id: "anonymous", name: "Anonymous", role: "none", email: "anonymous" },
    ipAddress: req.ip,
    userAgent,
  });
};
