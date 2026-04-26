import { Router } from "express";

import authMiddleware from "../middleware/auth.middleware";
import { authorize } from "../middleware/rbac.middleware";
import upload from "../middleware/multer.middleware";
import { getCurrentUser, updateProfile, getBirthdayUsers } from "../controllers/auth/users/getuser.controller";
import {
  createUser,
  getAllUsers,
  updateUser,
  deleteUser,
} from "../controllers/auth/users/createUser.controller";

const userrouter = Router();

userrouter.get("/me", authMiddleware, getCurrentUser);
userrouter.put("/update-profile", authMiddleware, upload.single("avatar"), updateProfile);
userrouter.get("/birthday-users", authMiddleware, getBirthdayUsers);
userrouter.post(
  "/createuser",
  authMiddleware,
  authorize("admin"),
  upload.single("avatar"),
  createUser,
);
userrouter.get("/get-all-users", authMiddleware, getAllUsers);
userrouter.put(
  "/update-user/:id",
  authMiddleware,
  authorize("admin"),
  upload.single("avatar"),
  updateUser,
);
userrouter.delete(
  "/delete-user/:id",
  authMiddleware,
  authorize("admin"),
  deleteUser,
);

export default userrouter;
