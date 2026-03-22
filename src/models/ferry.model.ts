import { model } from "mongoose";
import { IFerryRoute } from "../@types/interfaces/ferry.interface";
import ferrySchema from "./schemaDefinitions/ferry.schema";

const FerryModel = model<IFerryRoute>('FerryRoutes', ferrySchema);

export default FerryModel;
