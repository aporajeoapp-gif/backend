import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware";
import { authorize } from "../middleware/rbac.middleware";
import { getAllAuditLogs, getAuditLogById } from "../controllers/auditLog/auditLog.controller";

const auditLogRouter = Router();

// Only admin should be able to see audit logs
auditLogRouter.get("/fetch-all", authMiddleware, authorize("admin"), getAllAuditLogs);
auditLogRouter.get("/fetch-single/:id", authMiddleware, authorize("admin"), getAuditLogById);

export default auditLogRouter;
