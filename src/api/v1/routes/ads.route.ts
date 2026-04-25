import { Router } from "express";
import { createAd, deleteAd, getAds, updateAd } from "../controllers/ads/ads.controller";
import authMiddleware from "../middleware/auth.middleware";
import { authorize } from "../middleware/rbac.middleware";
import upload from "../middleware/multer.middleware";

const adsRouter = Router();

// Public route
adsRouter.get("/get-all-ads", getAds);

// Protected routes
adsRouter.post(
  "/create-ad",
  authMiddleware,
  authorize(undefined, "ads.create"),
  upload.single("image"),
  createAd
);

adsRouter.put(
  "/update-ad/:id",
  authMiddleware,
  authorize(undefined, "ads.update"),
  upload.single("image"),
  updateAd
);

adsRouter.delete(
  "/delete-ad/:id",
  authMiddleware,
  authorize(undefined, "ads.delete"),
  deleteAd
);

export default adsRouter;
