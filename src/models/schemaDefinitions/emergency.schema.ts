import SCHEMA_DEFINATION_PROPERTIES from "../../constants/model/model.constant";
import { IEmergencyService } from "../../@types/interfaces/emergency.interface";
import { Schema } from "mongoose";
import { GENERAL_SCHEMA_OPTIONS } from "../../constants/model/schemaOption";

const emergencySchema = new Schema<IEmergencyService>(
    {
        serviceName: SCHEMA_DEFINATION_PROPERTIES.requiredString,
        category: {
            type: String,
            required: true,
            trim: true,
            enum: ["Ambulance", "Fire", "Police", "Hospital", "Other"]
        },
        address: SCHEMA_DEFINATION_PROPERTIES.requiredString,
        contactPhone: {
            type: [String],
            required: true,
            default: []
        },
        location: {
            lat: { type: Number, required: false },
            lng: { type: Number, required: false }
        },
        createdBy: SCHEMA_DEFINATION_PROPERTIES.requiredString,
    },
    GENERAL_SCHEMA_OPTIONS
);

export default emergencySchema;
