import { Request, Response } from "express";
import { Types } from "mongoose";
import AuditLogModel from "../../../../models/auditLog.model";


const sanitizeData = (data: any): any => {
  if (!data) return data;

  // Handle Mongoose ObjectId
  if (data instanceof Types.ObjectId || (data._bsontype === "ObjectId") || (data.constructor && data.constructor.name === "ObjectId")) {
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

  // Handle Mongoose documents
  const dataObj = typeof data.toObject === "function" ? data.toObject() : data;
  const sanitized: any = { ...dataObj };
  const sensitiveFields = ["password", "token", "accessToken", "refreshToken", "__v"];

  for (const key in sanitized) {
    const value = sanitized[key];
    
    if (sensitiveFields.includes(key)) {
      delete sanitized[key];
      continue;
    }

    // Convert nested ObjectIds
    if (value instanceof Types.ObjectId || (value && value._bsontype === "ObjectId") || (value && value.constructor && value.constructor.name === "ObjectId")) {
      sanitized[key] = value.toString();
      continue;
    }

    // Convert nested Dates
    if (value instanceof Date || (value && typeof value.toISOString === "function")) {
      sanitized[key] = typeof value.toISOString === "function" ? value.toISOString() : value.toString();
      continue;
    }

    // Remove binary buffers that aren't IDs
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


export const getAllAuditLogs = async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      action, 
      severity, 
      startDate, 
      endDate 
    } = req.query as any;

    const query: any = {};

    if (search) {
      query.$or = [
        { userName: { $regex: search, $options: "i" } },
        { userEmail: { $regex: search, $options: "i" } },
        { task: { $regex: search, $options: "i" } },
        { details: { $regex: search, $options: "i" } },
      ];
    }

    if (action) query.action = action;
    if (severity) query.severity = severity;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate as string);
      if (endDate) query.createdAt.$lte = new Date(endDate as string);
    }

    const p = parseInt(page as string, 10) || 1;
    const l = parseInt(limit as string, 10) || 10;

    const logs = await AuditLogModel.find(query)
      .sort({ createdAt: -1 })
      .skip((p - 1) * l)
      .limit(l)
      .populate("user", "name email role");

    const total = await AuditLogModel.countDocuments(query);

    // Sanitize all logs
    const sanitizedLogs = logs.map((log: any) => sanitizeData(log));

    res.status(200).json({
      success: true,
      data: sanitizedLogs,
      pagination: {
        total,
        page: p,
        limit: l,
        pages: Math.ceil(total / l),
      },
    });
  } catch (error: any) {
    console.error("Get Audit Logs Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch audit logs", 
      error: error.message 
    });
  }
};


export const getAuditLogById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const log = await AuditLogModel.findById(id).populate("user", "name email role");

    if (!log) {
      return res.status(404).json({ success: false, message: "Audit log not found" });
    }

    // Sanitize log
    const sanitizedLog = sanitizeData(log);

    res.status(200).json({ success: true, data: sanitizedLog });
  } catch (error: any) {
    console.error("Get Audit Log By ID Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch audit log", 
      error: error.message 
    });
  }
};
