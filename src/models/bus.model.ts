import { model } from "mongoose";
import { IBusRoute } from "../@types/interfaces/bus.interface";
import busSchema from "./schemaDefinitions/bus.schema";

const BusModel = model<IBusRoute>('BusRoutes', busSchema);

export default BusModel;
