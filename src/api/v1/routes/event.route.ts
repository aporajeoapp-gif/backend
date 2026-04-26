import { Router } from "express";
import { createEvent, deleteEvent, getEvents, updateEvent, getLatestEvents } from "../controllers/event/event.controller";
import authMiddleware from "../middleware/auth.middleware";
import { authorize } from "../middleware/rbac.middleware";
import upload from "../middleware/multer.middleware";

const eventRouter = Router();

// Public route
eventRouter.get("/get-all-events", getEvents);
eventRouter.get("/get-latest-events", getLatestEvents);

// Protected routes
eventRouter.post(
  "/create-event",
  authMiddleware,
  authorize(undefined, "event.create"),
  upload.single("image"),
  createEvent
);

eventRouter.put(
  "/update-event/:id",
  authMiddleware,
  authorize(undefined, "event.update"),
  upload.single("image"),
  updateEvent
);

eventRouter.delete(
  "/delete-event/:id",
  authMiddleware,
  authorize(undefined, "event.delete"),
  deleteEvent
);

export default eventRouter;
