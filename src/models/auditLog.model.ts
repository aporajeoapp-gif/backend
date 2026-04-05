import { model } from "mongoose";
import { IAuditLog } from "../@types/interfaces/auditLog.interface";
import auditLogSchema from "./schemaDefinitions/auditLog.schema";

const AuditLogModel = model<IAuditLog>("AuditLogs", auditLogSchema);

export default AuditLogModel;
