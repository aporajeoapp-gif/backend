import { Request, Response } from "express";
import bcrypt from "bcrypt";
import UserModel from "../../../../../models/user.model";

export const createUser = async (req: Request, res: Response) => {
  const { name, email, password, role, permissions } = req.body;

  if (!name || !email || !password || !role) {
    return res
      .status(400)
      .json({
        message: "Missing required fields: name, email, password, role",
      });
  }

  const validRoles = ["admin", "coordinator", "member"];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  const userExists = await UserModel.findOne({ email });
  if (userExists) {
    return res
      .status(409)
      .json({ message: "User with this email already exists" });
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

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await UserModel.find().sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error: any) {
    console.error("Get Users Error:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch users", error: error.message });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
      return res.status(400).json({ message: "Missing required fields: id" });
    }

    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (updateData.email && updateData.email !== user.email) {
      const emailExists = await UserModel.findOne({ email: updateData.email });
      if (emailExists) {
        return res.status(409).json({ message: "Email already in use" });
      }
    }

    const fieldsToUpdate = [
      "name",
      "email",
      "role",
      "permissions",
      "isEmailVerified",
      "status",
    ];
    fieldsToUpdate.forEach((field) => {
      if (updateData[field] !== undefined) {
        (user as any)[field] = updateData[field];
      }
    });

    await user.save();

    res.status(200).json({
      message: "User updated successfully",
      user,
    });
  } catch (error: any) {
    console.error("Update User Error:", error);
    res
      .status(500)
      .json({ message: "Failed to update user", error: error.message });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Missing required fields: id" });
    }

    const user = await UserModel.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User deleted successfully",
      user,
    });
  } catch (error: any) {
    console.error("Delete User Error:", error);
    res
      .status(500)
      .json({ message: "Failed to delete user", error: error.message });
  }
};
