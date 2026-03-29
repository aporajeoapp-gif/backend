import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware";
import { authorize } from "../middleware/rbac.middleware";
import { getAnalyticsStats } from "../controllers/analytics/stats.controller";

const analyticsRouter = Router();

analyticsRouter.get(
  "/stats",
  authMiddleware,
  getAnalyticsStats
);

export default analyticsRouter;
