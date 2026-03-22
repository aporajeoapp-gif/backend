import { Router } from "express";
import { createDoctor, getDoctors } from "../controllers/doctor/doctor.controller";
import authMiddleware from "../middleware/auth.middleware";
import { authorize } from "../middleware/rbac.middleware";

const doctorRouter = Router();


doctorRouter.get("/get-all-doctors",authMiddleware, getDoctors);


doctorRouter.post("/create-doctor", authMiddleware, authorize(undefined, "doctor.create"), createDoctor);

export default doctorRouter;
