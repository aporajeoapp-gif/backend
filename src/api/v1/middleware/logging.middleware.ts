import { Request, Response, NextFunction } from "express";
import AuditLogModel from "../../../models/auditLog.model";
import { logger } from "../../../utils/logger";

// Helper to sanitize logging data (hides sensitive information like passwords and tokens)
const sanitizeLoggingData = (data: any): any => {
  if (!data) return data;
  if (typeof data !== "object") return data;
  if (Array.isArray(data)) {
    return data.map(sanitizeLoggingData);
  }

  const sanitized: any = {};
  const sensitiveFields = [
    "password",
    "token",
    "accessToken",
    "refreshToken",
    "currentPassword",
    "newPassword"
  ];

  for (const key in data) {
    if (sensitiveFields.includes(key)) {
      sanitized[key] = "[REDACTED]";
    } else if (typeof data[key] === "object") {
      sanitized[key] = sanitizeLoggingData(data[key]);
    } else {
      sanitized[key] = data[key];
    }
  }
  return sanitized;
};

// Middleware for logging successful API calls (status < 400)
export const successLoggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = process.hrtime();

  res.on("finish", () => {
    const statusCode = res.statusCode;
    if (statusCode < 400) {
      const diff = process.hrtime(startTime);
      const durationMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);

      logger.info({
        type: "api_success",
        method: req.method,
        url: req.originalUrl,
        statusCode,
        durationMs: parseFloat(durationMs),
        ip: req.ip,
        userAgent: req.headers["user-agent"],
        userId: (req as any).user?.userId || null,
        query: req.query,
        body: req.body ? sanitizeLoggingData(req.body) : null,
      }, `[API Success] ${req.method} ${req.originalUrl} - ${statusCode} - ${durationMs}ms`);
    }
  });

  next();
};

// Middleware for logging failed API responses (status >= 400)
export const errorLoggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = process.hrtime();

  res.on("finish", () => {
    const statusCode = res.statusCode;
    if (statusCode >= 400) {
      const diff = process.hrtime(startTime);
      const durationMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);

      logger.error({
        type: "api_failure",
        method: req.method,
        url: req.originalUrl,
        statusCode,
        durationMs: parseFloat(durationMs),
        ip: req.ip,
        userAgent: req.headers["user-agent"],
        userId: (req as any).user?.userId || null,
        query: req.query,
        body: req.body ? sanitizeLoggingData(req.body) : null,
      }, `[API Failure] ${req.method} ${req.originalUrl} - ${statusCode} - ${durationMs}ms`);

      const reqUser = (req as any).user;
      AuditLogModel.create({
        user: reqUser ? reqUser.userId : undefined,
        userName: reqUser ? reqUser.name : "Anonymous",
        userEmail: reqUser ? reqUser.email : "anonymous",
        userRole: reqUser ? reqUser.role : "none",
        action: "API_FAILURE",
        task: `${req.method} ${req.originalUrl}`,
        details: `Status: ${statusCode}, Duration: ${durationMs}ms`,
        severity: statusCode >= 500 ? "high" : "medium",
        payload: { oldData: null, newData: req.body ? sanitizeLoggingData(req.body) : null },
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"] || "unknown",
      }).catch((err: any) => logger.error({ err }, "Failed to save API failure log to DB"));
    }
  });

  next();
};

// Global error-handling middleware to catch uncaught/thrown errors
export const globalErrorLoggerMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.status || err.statusCode || 500;
  
  logger.error({
    type: "uncaught_exception",
    method: req.method,
    url: req.originalUrl,
    statusCode,
    ip: req.ip,
    userAgent: req.headers["user-agent"],
    userId: (req as any).user?.userId || null,
    query: req.query,
    body: req.body ? sanitizeLoggingData(req.body) : null,
    error: {
      message: err.message || "No error message provided",
      stack: err.stack || "No stack trace available",
    }
  }, `[Global Error] ${req.method} ${req.originalUrl} - ${statusCode} - ${err.message || "Internal Server Error"}`);

  const reqUser = (req as any).user;
  AuditLogModel.create({
    user: reqUser ? reqUser.userId : undefined,
    userName: reqUser ? reqUser.name : "Anonymous",
    userEmail: reqUser ? reqUser.email : "anonymous",
    userRole: reqUser ? reqUser.role : "none",
    action: "SERVER_CRASH",
    task: `${req.method} ${req.originalUrl}`,
    details: err.message || "Internal Server Error",
    severity: "high",
    payload: { oldData: null, newData: { stack: err.stack } },
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"] || "unknown",
  }).catch((dbErr: any) => logger.error({ dbErr }, "Failed to save crash log to DB"));

  next(err);
};
