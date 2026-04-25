import { Request, Response } from "express";
import bcrypt from "bcrypt";
import UserModel from "../../../../../models/user.model";
import { createAuditLog } from "../../../../../services/auditLog.service";


export const signup = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  const existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await UserModel.create({
   name,
    email,
    password: hashedPassword,
    isEmailVerified: false,
  });

  res.status(201).json({
    message: "User created",
    userId: user._id,
  });

  // Audit Log
  await createAuditLog({
    user: {
      id: user._id.toString(),
      name: user.name,
      role: user.role || "unknown",
      email: user.email,
    },
    action: "USER_SIGNUP",
    task: `User signed up: ${user.email}`,
    details: `New user account created`,
    severity: "low",
    payload: { newData: { email: user.email, name: user.name } },
    entityId: user._id.toString(),
    entityModel: "Users",
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
    location: (req.headers["x-latitude"] && req.headers["x-longitude"]) ? {
      lat: parseFloat(req.headers["x-latitude"] as string),
      lng: parseFloat(req.headers["x-longitude"] as string)
    } : undefined
  });
};

