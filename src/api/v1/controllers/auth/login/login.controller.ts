import { Request, Response } from "express";
import bcrypt from "bcrypt";
import UserModel from "../../../../../models/user.model";
import { decryptPassword } from "../../../../../utils/passencryption.utils";
import { generateToken } from "../../../../../utils/token.utils";
import { createAuditLog } from "../../../../../utils/logger";

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await UserModel.findOne({ email });

  if (!user || !user.password) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  const isBcryptHash = user.password.startsWith("$2b$") || user.password.startsWith("$2a$");
  let isValid = false;

  if (isBcryptHash) {
    isValid = await bcrypt.compare(password, user.password);
  } else {
    const originalPassword = decryptPassword(user.password);
    isValid = password === originalPassword;
  }

  if (!isValid) {
    return res.status(401).json({ message: "Invalid credentials" });
  }


  if (user.status === "deactive" && user.role !== "admin") {
    return res.status(403).json({
      message: "Account deactivated. Please contact the administrator.",
    });
  }


  const token = generateToken({
    userId: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role || "member",
  });

  res.json({
    message:"Login successfully",
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
    },
  });

  // Audit Log
  await createAuditLog({
    user: {
      id: user._id.toString(),
      name: user.name,
      role: user.role,
      email: user.email,
    },
    action: "USER_LOGIN",
    task: `User logged in: ${user.email}`,
    details: `Successful login for user ${user.name}`,
    severity: "low",
    payload: { newData: { email: user.email, role: user.role } },
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