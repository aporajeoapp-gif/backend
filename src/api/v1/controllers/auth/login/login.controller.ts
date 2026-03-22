import UserModel from "../../../../../models/user.model";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { generateToken } from "../../../../../utils/token.utils";

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await UserModel.findOne({ email });
  if (!user || !user.password) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // 🔥 Check if user is deactivated (Admins can always log in)
  if (user.status === "deactive" && user.role !== "admin") {
    return res.status(403).json({
      message: "Account deactivated. Please contact the administrator.",
    });
  }

  const token = generateToken({
    userId: user._id.toString(),
    name: user.name,
  });

  res.json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
    },
  });
};
