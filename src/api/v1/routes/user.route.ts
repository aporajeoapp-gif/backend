import { Router } from "express";

import authMiddleware from "../middleware/auth.middleware";
import { authorize } from "../middleware/rbac.middleware";
import { getCurrentUser } from "../controllers/auth/users/getuser.controller";
import { createUser } from "../controllers/auth/users/createUser.controller";

const userrouter = Router();

userrouter.get("/me", authMiddleware, getCurrentUser);
userrouter.post("/createuser", authMiddleware, authorize("admin"), createUser);

export default userrouter;
