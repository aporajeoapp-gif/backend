import UserModel from "../../../../../models/user.model";
import { Request, Response } from "express";

import { uploadToS3, deleteFromS3 } from "../../../../../utils/s3.utils";
import { AuthenticatedRequest } from "../../../middleware/rbac.middleware";

export const getCurrentUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "User ID not found in token" });
    }

    const user = await UserModel.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found in database" });
    }

    res.json({
      message: "User fetched successfully",
      user,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch user", error: String(error) });
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { name } = req.body;
    const file = req.file;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) user.name = name;

    if (file) {
      if (user.avatar) {
        await deleteFromS3(user.avatar);
      }
      const { secure_url } = await uploadToS3(
        file.buffer,
        "profileimage",
        file.originalname,
        file.mimetype
      );
      user.avatar = secure_url;
    }

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        status: user.status
      }
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res
      .status(500)
      .json({ message: "Failed to update profile", error: String(error) });
  }
};
