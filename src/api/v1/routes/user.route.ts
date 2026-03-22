import { Router } from "express";

import authMiddleware from "../middleware/auth.middleware";
import { authorize } from "../middleware/rbac.middleware";
import { getCurrentUser } from "../controllers/auth/users/getuser.controller";
import { createUser, getAllUsers, updateUser } from "../controllers/auth/users/createUser.controller";

const userrouter = Router();

userrouter.get("/me", authMiddleware, getCurrentUser);
userrouter.post("/createuser", authMiddleware, authorize("admin"), createUser);
userrouter.get("/get-all-users", authMiddleware, authorize("admin"), getAllUsers);
userrouter.put("/update-user/:id", authMiddleware, authorize("admin"), updateUser);

export default userrouter;
