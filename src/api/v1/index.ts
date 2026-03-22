import { Router } from "express";
import authrouter from "./routes/auth.route";
import userrouter from "./routes/user.route";
import doctorRouter from "./routes/doctor.route";

const v1router = Router();

v1router.use("/auth", authrouter);
v1router.use("/user", userrouter);
v1router.use("/doctor", doctorRouter);

export default v1router;
