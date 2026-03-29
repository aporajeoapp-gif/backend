import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware";
import {
  createFerry,
  getFerries,
  updateFerry,
  deleteFerry,
} from "../controllers/ferry/ferry.controller";
import { authorize } from "../middleware/rbac.middleware";

const ferryRouter = Router();

ferryRouter.post(
  "/create-ferry",
  authMiddleware,
  authorize(undefined, "ferry.create"),
  createFerry,
);

ferryRouter.get(
  "/get-all-ferries",
  authMiddleware,
  authorize(undefined, "ferry.read"),
  getFerries,
);

ferryRouter.put(
  "/update-ferry/:id",
  authMiddleware,
  authorize(undefined, "ferry.update"),
  updateFerry,
);

ferryRouter.delete(
  "/delete-ferry/:id",
  authMiddleware,
  authorize(undefined, "ferry.delete"),
  deleteFerry,
);

export default ferryRouter;
