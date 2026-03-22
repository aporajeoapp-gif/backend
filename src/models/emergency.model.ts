import { model } from "mongoose";
import { IEmergencyService } from "../@types/interfaces/emergency.interface";
import emergencySchema from "./schemaDefinitions/emergency.schema";

const EmergencyModel = model<IEmergencyService>('EmergencyServices', emergencySchema);

export default EmergencyModel;
