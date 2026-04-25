import { Router } from "express";
import authrouter from "./routes/auth.route";
import userrouter from "./routes/user.route";
import doctorRouter from "./routes/doctor.route";
import busRouter from "./routes/bus.route";
import ferryRouter from "./routes/ferry.route";
import emergencyRouter from "./routes/emergency.route";
import bulkrouter from "./routes/bulk.route";
import analyticsRouter from "./routes/analytics.route";

import auditLogRouter from "./routes/auditLog.route";
import bloodCampRouter from "./routes/bloodCamp.route";
import adsRouter from "./routes/ads.route";
import eventRouter from "./routes/event.route";


const v1router = Router();

v1router.use("/auth", authrouter);
v1router.use("/user", userrouter);
v1router.use("/doctor", doctorRouter);
v1router.use("/bus", busRouter);
v1router.use("/ferry", ferryRouter);
v1router.use("/emergency", emergencyRouter);
v1router.use("/bulk",bulkrouter)
v1router.use("/analytics", analyticsRouter);
v1router.use("/audit-logs", auditLogRouter);
v1router.use("/blood-camp", bloodCampRouter);
v1router.use("/ads", adsRouter);
v1router.use("/events", eventRouter);

export default v1router;
