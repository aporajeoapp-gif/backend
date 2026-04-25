import { Request, Response } from "express";
import bcrypt from "bcrypt";
import UserModel from "../../../../../models/user.model";
import { decryptPassword, encryptPassword } from "../../../../../utils/passencryption.utils";
import { createAuditLog } from "../../../../../services/auditLog.service";
import { AuthenticatedRequest } from "../../../middleware/rbac.middleware";
import { uploadToS3, deleteFromS3 } from "../../../../../utils/s3.utils";

export const createUser = async (req: AuthenticatedRequest, res: Response) => {
  const { name, email, password, role, permissions } = req.body;
  const file = req.file;

  if (!name || !email || !password || !role) {
    return res.status(400).json({
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

  const hashedPassword = encryptPassword(password);

  let avatarUrl = null;
  if (file) {
    const { secure_url } = await uploadToS3(
      file.buffer,
      "profileimage",
      file.originalname,
      file.mimetype
    );
    avatarUrl = secure_url;
  }

  const newUser = await UserModel.create({
    name,
    email,
    password: hashedPassword,
    role,
    permissions: permissions || [],
    avatar: avatarUrl,
    isEmailVerified: true, // Assuming admin-created accounts are verified or set to true by default
  });

  res.status(201).json({
    message: "User created successfully",
    user: {
      ...newUser.toObject(),
      password: decryptPassword(newUser.password || ""), // Return as plain text for frontend consistency
    },
  });

  // Audit Log
  if (req.user) {
    await createAuditLog({
      user: {
        id: req.user.userId,
        name: req.user.name,
        role: req.user.role,
        email: req.user.email,
      },
      action: "USER_CREATE",
      task: `Created user: ${newUser.name}`,
      details: `Admin created a new user with role: ${newUser.role}`,
      severity: "medium",
      payload: {
        newData: {
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          permissions: newUser.permissions,
        },
      },
      entityId: newUser._id.toString(),
      entityModel: "Users",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
  }
};

export const getAllUsers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const users = await UserModel.find().sort({ createdAt: -1 });
    const result = users.map((user) => {
      const decrypted = decryptPassword(user.password || "");
      return {
        ...user.toObject(),
        password: decrypted || user.password, // Fallback to raw string if decryption fails
      };
    });

    res.status(200).json(result);
  } catch (error: any) {
    console.error("Get Users Error:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch users", error: error.message });
  }
};

export const updateUser = async (req: AuthenticatedRequest, res: Response) => {
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
      "avatar",
    ];

    if (req.file) {
      if (user.avatar) {
        await deleteFromS3(user.avatar);
      }
      const { secure_url } = await uploadToS3(
        req.file.buffer,
        "profileimage",
        req.file.originalname,
        req.file.mimetype
      );
      user.avatar = secure_url;
    }

    const oldData = user.toObject();

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

    const modifiedFields = Object.keys(updateData).filter(key => fieldsToUpdate.includes(key));
    let changeDetails = `Modified fields: ${modifiedFields.join(", ")}`;
    
    if (updateData.role && updateData.role !== oldData.role) {
      changeDetails = `Role changed from ${oldData.role} to ${updateData.role}`;
    } else if (updateData.status && updateData.status !== oldData.status) {
      changeDetails = `Status changed from ${oldData.status} to ${updateData.status}`;
    }

    // Audit Log
    if (req.user) {
      await createAuditLog({
        user: {
          id: req.user.userId,
          name: req.user.name,
          role: req.user.role,
          email: req.user.email,
        },
        action: "USER_UPDATE",
        task: `Updated user: ${user.name}`,
        details: changeDetails,
        severity: "medium",
        payload: {
          oldData,
          newData: user.toObject(),
        },
        entityId: user._id.toString(),
        entityModel: "Users",
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      });
    }
  } catch (error: any) {
    console.error("Update User Error:", error);
    res
      .status(500)
      .json({ message: "Failed to update user", error: error.message });
  }
};

export const deleteUser = async (req: AuthenticatedRequest, res: Response) => {
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

    // Audit Log
    if (req.user) {
      await createAuditLog({
        user: {
          id: req.user.userId,
          name: req.user.name,
          role: req.user.role,
          email: req.user.email,
        },
        action: "USER_DELETE",
        task: `Deleted user: ${user.name}`,
        details: `User ${user.email} was permanently deleted.`,
        severity: "high",
        payload: {
          oldData: user.toObject(),
        },
        entityId: user._id.toString(),
        entityModel: "Users",
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      });
    }
  } catch (error: any) {
    console.error("Delete User Error:", error);
    res
      .status(500)
      .json({ message: "Failed to delete user", error: error.message });
  }
};
