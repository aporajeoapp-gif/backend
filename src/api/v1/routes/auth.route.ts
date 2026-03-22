import { Router } from "express";
import { signup } from "../controllers/auth/signup/signup.controller";
import { login } from "../controllers/auth/login/login.controller";



const authrouter = Router();

authrouter.post("/signup", signup);
authrouter.post("/login", login);


export default authrouter;