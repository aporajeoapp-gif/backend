import { model } from "mongoose";
import { IBloodCamp } from "../@types/interfaces/blood.interface";
import bloodCampSchema from "./schemaDefinitions/bloodCamp.schema";

const BloodCampModel = model<IBloodCamp>('BloodCamps', bloodCampSchema);

export default BloodCampModel;
