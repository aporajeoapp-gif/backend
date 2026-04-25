import { Request, Response } from "express";
import UserModel from "../../../../../models/user.model";
import { encryptPassword } from "../../../../../utils/passencryption.utils";
import { createAuditLog } from "../../../../../services/auditLog.service";

export const adminSignup = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  const existingAdmin = await UserModel.findOne({ role: "admin" });


  const userExists = await UserModel.findOne({ email });
  if (userExists) {
    return res.status(409).json({ message: "User already exists" });
  }

  const hashedPassword = encryptPassword(password);

  const admin = await UserModel.create({
    name,
    email,
    password: hashedPassword,
    role: "admin",
    permissions: ["*"], 
    isEmailVerified: true,
  });

  res.status(201).json({
    message: "Admin created successfully",
    adminId: admin._id,
  });

  // Audit Log
  await createAuditLog({
    user: {
      id: admin._id.toString(),
      name: admin.name,
      role: admin.role,
      email: admin.email,
    },
    action: "ADMIN_SIGNUP",
    task: `Admin signed up: ${admin.email}`,
    details: `Initial admin account created`,
    severity: "high",
    payload: { newData: { email: admin.email, name: admin.name } },
    entityId: admin._id.toString(),
    entityModel: "Users",
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
    location: (req.headers["x-latitude"] && req.headers["x-longitude"]) ? {
      lat: parseFloat(req.headers["x-latitude"] as string),
      lng: parseFloat(req.headers["x-longitude"] as string)
    } : undefined
  });
};

