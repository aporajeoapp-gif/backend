import { Request, Response, NextFunction } from "express";
import UserModel from "../../../models/user.model";
import { Role } from "../../../@types/constant/userRole.constant";
import { Permission } from "../../../@types/constant/permissions.contant";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    name: string;
    email: string;
    role: Role;
    permissions?: Permission[];
  };
}

export const authorize = (
  requiredRole?: Role,
  requiredPermission?: Permission,
) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (!req.user || !req.user.userId) {
        return res
          .status(401)
          .json({ message: "Unauthorized: No user attached to request" });
      }

      const user = await UserModel.findById(req.user.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Ensure req.user has full details from the database (fixes old tokens)
      if (req.user) {
        req.user.name = user.name;
        req.user.email = user.email;
        req.user.role = user.role as Role;
      }

      // Admin bypass
      if (user.role === "admin") {
        return next();
      }

      // Role check
      if (requiredRole && user.role !== requiredRole) {
        return res
          .status(403)
          .json({ message: `Forbidden: Required role ${requiredRole}` });
      }

      // Permission check
      if (requiredPermission) {
        const hasPermission =
          user.permissions?.includes(requiredPermission) ||
          user.permissions?.includes("*") ||
          false;

        if (!hasPermission) {
          return res.status(403).json({
            message: `Forbidden: Required permission ${requiredPermission}`,
          });
        }
      }

      next();
    } catch (error) {
      console.error("Authorization Error:", error);
      res
        .status(500)
        .json({ message: "Internal server error during authorization" });
    }
  };
};
