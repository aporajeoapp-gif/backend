import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware";
import {
  createBus,
  getBuses,
  updateBus,
  deleteBus,
} from "../controllers/bus/bus.controller";
import { authorize } from "../middleware/rbac.middleware";

const busRouter = Router();

busRouter.post(
  "/create-bus",
  authMiddleware,
  authorize(undefined, "bus.create"),
  createBus,
);
busRouter.get(
  "/get-all-buses",
  authMiddleware,
  authorize(undefined, "bus.read"),
  getBuses,
);

busRouter.put(
  "/update-bus/:id",
  authMiddleware,
  authorize(undefined, "bus.update"),
  updateBus,
);
busRouter.delete(
  "/delete-bus/:id",
  authMiddleware,
  authorize(undefined, "bus.delete"),
  deleteBus,
);
export default busRouter;
