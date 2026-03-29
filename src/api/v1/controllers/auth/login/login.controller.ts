import { Request, Response } from "express";
import bcrypt from "bcrypt";
import UserModel from "../../../../../models/user.model";
import { decryptPassword } from "../../../../../utils/passencryption.utils";
import { generateToken } from "../../../../../utils/token.utils";

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
};