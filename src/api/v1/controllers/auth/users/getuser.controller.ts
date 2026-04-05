import UserModel from "../../../../../models/user.model";
import { Request, Response } from "express";

interface AuthRequest extends Request {
  user?: {
    userId: string;
  };
}
export const getCurrentUser = async (req: AuthRequest, res: Response) => {
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

export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
  } catch (error) {
    console.error("Error fetching user:", error);
    res
      .status(500)
      .json({ message: "Failed to update user", error: String(error) });
  }
};
