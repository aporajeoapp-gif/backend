import { Router } from "express";

import authMiddleware from "../middleware/auth.middleware";
import { getCurrentUser } from "../controllers/auth/users/getuser.controller";

const userrouter = Router();

userrouter.get("/me", authMiddleware, getCurrentUser);

export default userrouter;
