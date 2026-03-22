import { Request, Response } from "express";
import bcrypt from "bcrypt";
import UserModel from "../../../../../models/user.model";

export const createUser = async (req: Request, res: Response) => {
  const { name, email, password, role, permissions } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: "Missing required fields: name, email, password, role" });
  }


  const validRoles = ["admin", "coordinator", "member"];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  const userExists = await UserModel.findOne({ email });
  if (userExists) {
    return res.status(409).json({ message: "User with this email already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await UserModel.create({
    name,
    email,
    password: hashedPassword,
    role,
    permissions: permissions || [],
    isEmailVerified: true, // Assuming admin-created accounts are verified or set to true by default
  });

  res.status(201).json({
    message: "User created successfully",
    userId: newUser._id,
    role: newUser.role,
  });
};
