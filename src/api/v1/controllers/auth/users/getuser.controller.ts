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

    const todayStr = new Date().toISOString().slice(5, 10); // MM-DD
    const dobStr = user.dob ? user.dob.slice(5, 10) : null;
    const isBirthday = dobStr === todayStr;

    res.json({
      message: "User fetched successfully",
      user: {
        ...user.toObject(),
        isBirthday
      },
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
    const { name, phno, address, dob } = req.body;
    const file = req.file;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) user.name = name;
    if (phno !== undefined) user.phno = phno;
    if (address !== undefined) user.address = address;
    if (dob !== undefined) user.dob = dob;

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
        status: user.status,
        phno: user.phno,
        address: user.address,
        dob: user.dob
      }
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res
      .status(500)
      .json({ message: "Failed to update profile", error: String(error) });
  }
};

export const getBirthdayUsers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const todayStr = new Date().toISOString().slice(5, 10); // MM-DD
    
    const users = await UserModel.find({
      dob: { $regex: new RegExp(`-${todayStr}$`) }
    }).select("name email dob avatar");

    res.status(200).json(users);
  } catch (error: any) {
    console.error("Get Birthday Users Error:", error);
    res.status(500).json({ message: "Failed to fetch birthday users", error: error.message });
  }
};
