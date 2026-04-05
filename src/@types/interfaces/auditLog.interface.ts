import { Types } from "mongoose";

export interface IAuditLog {
  user: Types.ObjectId;
  userName: string;
  userEmail: string;
  userRole: string;
  action: string;
  task: string;
  details: string;
  severity: "low" | "medium" | "high";
  payload: {
    oldData?: any;
    newData?: any;
  };
  entityId?: Types.ObjectId;
  entityModel?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

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
