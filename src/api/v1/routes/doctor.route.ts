import { Router } from "express";
import { createDoctor, deleteDoctor, getDoctors, updateDoctor } from "../controllers/doctor/doctor.controller";
import authMiddleware from "../middleware/auth.middleware";
import { authorize } from "../middleware/rbac.middleware";

const doctorRouter = Router();


doctorRouter.get("/get-all-doctors", getDoctors);


doctorRouter.post(
  "/create-doctor",
  authMiddleware,
  authorize(undefined, "doctor.create"),
  createDoctor
);

doctorRouter.put(
  "/update-doctor/:id",
  authMiddleware,
  authorize(undefined, "doctor.update"),
  updateDoctor
);

doctorRouter.delete(
  "/delete-doctor/:id",
  authMiddleware,
  authorize(undefined, "doctor.delete"),
  deleteDoctor
);

export default doctorRouter;
