import { model } from "mongoose";
import { IDonor } from "../@types/interfaces/blood.interface";
import donorSchema from "./schemaDefinitions/donor.schema";

const DonorModel = model<IDonor>('Donors', donorSchema);

export default DonorModel;
