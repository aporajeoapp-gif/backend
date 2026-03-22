import { Request, Response } from "express";
import bcrypt from "bcrypt";
import UserModel from "../../../../../models/user.model";

export const adminSignup = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  const existingAdmin = await UserModel.findOne({ role: "admin" });


  const userExists = await UserModel.findOne({ email });
  if (userExists) {
    return res.status(409).json({ message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

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
};
