import { Request, Response } from "express";
import UserModel from "../../../../../models/user.model";
import { encryptPassword } from "../../../../../utils/passencryption.utils";
import { createAuditLog } from "../../../../../services/auditLog.service";

export const superAdminSignup = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  // Check if a super admin already exists
  const existingSuperAdmin = await UserModel.findOne({ role: "super_admin" });
  if (existingSuperAdmin) {
    return res.status(403).json({ message: "Super Admin already exists. Only one Super Admin is allowed." });
  }

  const userExists = await UserModel.findOne({ email });
  if (userExists) {
    return res.status(409).json({ message: "User with this email already exists" });
  }

  const hashedPassword = encryptPassword(password);

  const superAdmin = await UserModel.create({
    name,
    email,
    password: hashedPassword,
    role: "super_admin",
    permissions: ["*"], 
    isEmailVerified: true,
  });

  res.status(201).json({
    message: "Super Admin created successfully",
    superAdminId: superAdmin._id,
  });

  // Audit Log
  await createAuditLog({
    user: {
      id: superAdmin._id.toString(),
      name: superAdmin.name,
      role: superAdmin.role,
      email: superAdmin.email,
    },
    action: "SUPER_ADMIN_SIGNUP",
    task: `Super Admin signed up: ${superAdmin.email}`,
    details: `Initial super admin account created`,
    severity: "high",
    payload: { newData: { email: superAdmin.email, name: superAdmin.name } },
    entityId: superAdmin._id.toString(),
    entityModel: "Users",
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
  });
};
