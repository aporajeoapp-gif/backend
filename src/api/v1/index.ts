import { Router } from "express";
import authrouter from "./routes/auth.route";
import userrouter from "./routes/user.route";
import doctorRouter from "./routes/doctor.route";
import busRouter from "./routes/bus.route";
import ferryRouter from "./routes/ferry.route";
import emergencyRouter from "./routes/emergency.route";

const v1router = Router();

v1router.use("/auth", authrouter);
v1router.use("/user", userrouter);
v1router.use("/doctor", doctorRouter);
v1router.use("/bus", busRouter);
v1router.use("/ferry", ferryRouter);
v1router.use("/emergency", emergencyRouter);

export default v1router;
