import { Router } from "express";

import authMiddleware from "../middleware/auth.middleware";
import { authorize } from "../middleware/rbac.middleware";
import { getCurrentUser } from "../controllers/auth/users/getuser.controller";
import { createUser, getAllUsers, updateUser, deleteUser } from "../controllers/auth/users/createUser.controller";

const userrouter = Router();

userrouter.get("/me", authMiddleware, getCurrentUser);
userrouter.post("/createuser", authMiddleware, authorize("admin"), createUser);
userrouter.get("/get-all-users", authMiddleware, getAllUsers);
userrouter.put("/update-user/:id", authMiddleware, authorize("admin"), updateUser);
userrouter.delete("/delete-user/:id", authMiddleware, authorize("admin"), deleteUser);

export default userrouter;
