import { Request, Response, NextFunction } from "express";
import { Permission, Role } from "../../../constants/model/model.constant";
import UserModel from "../../../models/user.model";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    name: string;
    role?: Role;
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

      // Attach name to req.user if not already present
      if (req.user && !req.user.name) {
        req.user.name = user.name;
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
