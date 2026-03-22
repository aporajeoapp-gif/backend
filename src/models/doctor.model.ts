import { model } from "mongoose";
import { IDoctor } from "../@types/interfaces/doctor.interface";
import doctorSchema from "./schemaDefinitions/doctor.schema";

const DoctorModel = model<IDoctor>('Doctors', doctorSchema);

export default DoctorModel;
