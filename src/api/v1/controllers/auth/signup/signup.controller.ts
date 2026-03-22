import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import UserModel from "../../../../../models/user.model";


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
};
