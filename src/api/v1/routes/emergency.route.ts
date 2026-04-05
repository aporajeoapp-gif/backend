import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware";
import { authorize } from "../middleware/rbac.middleware";
import { createEmergencyService, deleteEmergencyService, getEmergencyServices, updateEmergencyService } from "../controllers/emergency/emergency.controller";

const emergencyRouter = Router();

emergencyRouter.post(
    "/create-emergency-service",
    authMiddleware,
    authorize(undefined, "emergency.create"),
    createEmergencyService
);

emergencyRouter.get(
    "/get-all-emergency-services",
    authMiddleware,
    authorize(undefined, "emergency.read"),
    getEmergencyServices
);

emergencyRouter.put(
    "/update-emergency-service/:id",
    authMiddleware,
    authorize(undefined, "emergency.update"),
    updateEmergencyService
);

emergencyRouter.delete(
    "/delete-emergency-service/:id",
    authMiddleware,
    authorize(undefined, "emergency.delete"),
    deleteEmergencyService
);

export default emergencyRouter;
