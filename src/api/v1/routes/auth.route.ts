import { Router } from "express";
import { signup } from "../controllers/auth/signup/signup.controller";
import { login } from "../controllers/auth/login/login.controller";
import { adminSignup } from "../controllers/auth/signup/adminSignup.controller";
import { superAdminSignup } from "../controllers/auth/signup/superAdminSignup.controller";

const authrouter = Router();

authrouter.post("/signup", signup);
authrouter.post("/login", login);
authrouter.post("/admin/signup", adminSignup);
authrouter.post("/super-admin/signup", superAdminSignup);

export default authrouter;