import { createBloodCamp, deleteBloodCamp, getBloodCampById, getBloodCamps, updateBloodCamp } from "../controllers/bloodCamp/bloodCamp.controller";
import { addDonorToCamp, deleteDonor, getCampDonors } from "../controllers/bloodCamp/donor.controller";
import authMiddleware from "../middleware/auth.middleware";
import { authorize } from "../middleware/rbac.middleware";
import upload from "../middleware/multer.middleware";
import { Router } from "express";

const bloodCampRouter = Router();

// Public route
bloodCampRouter.get("/get-all-camps", getBloodCamps);
bloodCampRouter.get("/get-camp/:id", getBloodCampById);

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

// Donor routes
bloodCampRouter.post(
  "/add-donor",
  authMiddleware,
  authorize(undefined, "blood.update"),
  addDonorToCamp
);

bloodCampRouter.get(
  "/get-camp-donors/:campId",
  authMiddleware,
  getCampDonors
);

bloodCampRouter.delete(
  "/delete-donor/:id",
  authMiddleware,
  authorize(undefined, "blood.delete"),
  deleteDonor
);

export default bloodCampRouter;
