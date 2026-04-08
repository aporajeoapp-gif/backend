import { Router } from "express";
import { createBloodCamp, deleteBloodCamp, getBloodCamps, updateBloodCamp } from "../controllers/bloodCamp/bloodCamp.controller";
import authMiddleware from "../middleware/auth.middleware";
import { authorize } from "../middleware/rbac.middleware";
import upload from "../middleware/multer.middleware";

const bloodCampRouter = Router();

// Public route
bloodCampRouter.get("/get-all-camps", getBloodCamps);

// Protected routes
bloodCampRouter.post(
  "/create-camp",
  authMiddleware,
  authorize(undefined, "blood.create"),
  upload.single("banner"),
  createBloodCamp
);

bloodCampRouter.put(
  "/update-camp/:id",
  authMiddleware,
  authorize(undefined, "blood.update"),
  upload.single("banner"),
  updateBloodCamp
);

bloodCampRouter.delete(
  "/delete-camp/:id",
  authMiddleware,
  authorize(undefined, "blood.delete"),
  deleteBloodCamp
);

export default bloodCampRouter;
