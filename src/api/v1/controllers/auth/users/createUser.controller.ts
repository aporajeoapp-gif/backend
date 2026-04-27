import { Request, Response } from "express";
import bcrypt from "bcrypt";
import UserModel from "../../../../../models/user.model";
import { decryptPassword, encryptPassword } from "../../../../../utils/passencryption.utils";
import { createAuditLog } from "../../../../../services/auditLog.service";
import { AuthenticatedRequest } from "../../../middleware/rbac.middleware";
import { uploadToS3, deleteFromS3 } from "../../../../../utils/s3.utils";

const normalizePermissions = (body: any, requester: any): string[] | undefined => {
  // Check for both 'permissions' and 'permissions[]' keys
  const perms = body.permissions || body["permissions[]"];
  if (perms === undefined) return undefined;
  
  const permsArray = Array.isArray(perms) ? perms : [perms];
  const requestedPerms = permsArray.filter((p) => p && p !== "__EMPTY__");

  // If requester is super_admin or admin, they can grant any permission
  if (requester?.role === "super_admin" || requester?.role === "admin") return requestedPerms;

  // Otherwise, requester can only grant subset of their own permissions (e.g. Coordinators)
  const requesterPerms = requester?.permissions || [];
  if (requesterPerms.includes("*")) return requestedPerms;

  return requestedPerms.filter(p => requesterPerms.includes(p));
};

export const createUser = async (req: AuthenticatedRequest, res: Response) => {
  const { name, email, password, role, phno, address, dob } = req.body;
  const permissions = normalizePermissions(req.body, req.user) || [];
  const file = req.file;

  if (!name || !email || !password || !role) {
    return res.status(400).json({
      message: "Missing required fields: name, email, password, role",
    });
  }

  const validRoles: string[] = [];
  if (req.user?.role === "super_admin") {
    validRoles.push("admin", "coordinator", "member");
  } else if (req.user?.role === "admin") {
    validRoles.push("admin", "coordinator", "member");
  }

  if (!validRoles.includes(role)) {
    return res.status(403).json({ message: "Forbidden: You do not have permission to create this role" });
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
    permissions: permissions,
    avatar: avatarUrl,
    phno: phno || null,
    address: address || null,
    dob: dob || null,
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
    const query = { role: { $ne: "super_admin" } };
    
    const users = await UserModel.find(query).sort({ createdAt: -1 });
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
    const updateData = { ...req.body };

    const normalizedPerms = normalizePermissions(req.body, req.user);
    if (normalizedPerms !== undefined) {
      updateData.permissions = normalizedPerms;
    }

    if (!id) {
      return res.status(400).json({ message: "Missing required fields: id" });
    }

    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Role Hierarchy & Permission Constraints
    if (req.user) {
      const requesterRole = req.user.role;
      const targetRole = user.role;

      // Cannot update Super Admin unless you are Super Admin
      if (targetRole === "super_admin" && requesterRole !== "super_admin") {
        return res.status(403).json({ message: "Forbidden: Cannot update Super Admin" });
      }

      // Hierarchy & Permission Rules
      if (requesterRole === "coordinator") {
        // Coordinators cannot edit permissions for ANYONE
        if (updateData.permissions) delete updateData.permissions;
      }

      // Admins cannot change their own permissions
      if (requesterRole === "admin" && id === req.user.userId) {
         if (updateData.permissions) {
            delete updateData.permissions;
         }
      }

      // Hierarchy check for role change
      if (updateData.role && updateData.role !== targetRole) {
        const allowedRoles: string[] = [];
        if (requesterRole === "super_admin") {
          allowedRoles.push("admin", "coordinator", "member");
        } else if (requesterRole === "admin") {
          allowedRoles.push("admin", "coordinator", "member");
        }

        if (!allowedRoles.includes(updateData.role)) {
          return res.status(403).json({ message: "Forbidden: Cannot change role to " + updateData.role });
        }
      }
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
      "phno",
      "address",
      "dob",
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
        user.set(field, updateData[field]);
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

    const userToDelete = await UserModel.findById(id);
    if (!userToDelete) {
      return res.status(404).json({ message: "User not found" });
    }

    // Hierarchy check
    if (req.user) {
      if (userToDelete.role === "super_admin" && req.user.role !== "super_admin") {
        return res.status(403).json({ message: "Forbidden: Cannot delete Super Admin" });
      }
      
      if (req.user.role === "admin" && userToDelete.role === "admin" && id !== req.user.userId) {
          // One admin can delete another admin? Usually yes if permissions allow, but user said "another admin can edit other admin"
          // We leave it for now or restrict it if needed.
      }
    }

    const user = await UserModel.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.avatar) {
      await deleteFromS3(user.avatar);
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
