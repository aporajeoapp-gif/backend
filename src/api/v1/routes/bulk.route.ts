import express from "express";
import authMiddleware from "../middleware/auth.middleware";
import { authorize } from "../middleware/rbac.middleware";
import { bulkInsert } from "../controllers/bulk/bulk.controller";
import BusModel from "../../../models/bus.model";
import FerryModel from "../../../models/ferry.model";
import DoctorModel from "../../../models/doctor.model";
import EmergencyModel from "../../../models/emergency.model";


const bulkrouter = express.Router();

// 🔥 Only admin can bulk insert
bulkrouter.post(
  "/bus/bulk",
  authMiddleware,
  authorize("admin"),
  bulkInsert(BusModel)
);

bulkrouter.post(
  "/ferry/bulk",
  authMiddleware,
  authorize("admin"),
  bulkInsert(FerryModel)
);

bulkrouter.post(
  "/doctor/bulk",
  authMiddleware,
  authorize("admin"),
  bulkInsert(DoctorModel)
);

bulkrouter.post(
  "/emergency/bulk",
  authMiddleware,
  authorize("admin"),
  bulkInsert(EmergencyModel)
);

export default bulkrouter;