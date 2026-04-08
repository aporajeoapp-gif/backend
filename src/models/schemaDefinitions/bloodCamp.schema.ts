import SCHEMA_DEFINATION_PROPERTIES from "../../constants/model/model.constant";
import { IBloodCamp } from "../../@types/interfaces/blood.interface";
import { Schema } from "mongoose";
import { GENERAL_SCHEMA_OPTIONS } from "../../constants/model/schemaOption";

const bloodCampSchema = new Schema<IBloodCamp>(
    {
        campName: SCHEMA_DEFINATION_PROPERTIES.requiredString,
        organizer: SCHEMA_DEFINATION_PROPERTIES.requiredString,
        date: SCHEMA_DEFINATION_PROPERTIES.requiredString,
        time: SCHEMA_DEFINATION_PROPERTIES.requiredString,
        location: SCHEMA_DEFINATION_PROPERTIES.requiredString,
        address: SCHEMA_DEFINATION_PROPERTIES.requiredString,
        city: SCHEMA_DEFINATION_PROPERTIES.requiredString,
        bloodGroupsNeeded: {
            type: [String],
            required: true,
            default: []
        },
        banner_image: SCHEMA_DEFINATION_PROPERTIES.optionalNullString,
        contactPhone: SCHEMA_DEFINATION_PROPERTIES.requiredString,
        contactEmail: SCHEMA_DEFINATION_PROPERTIES.requiredString,
        description: SCHEMA_DEFINATION_PROPERTIES.optionalNullString,
        status: {
            type: String,
            required: true,
            trim: true,
            enum: ["upcoming", "ongoing", "completed"],
            default: "upcoming"
        },
        targetUnits: SCHEMA_DEFINATION_PROPERTIES.requiredNumber,
        collectedUnits: {
            type: Number,
            required: true,
            default: 0
        },
        createdBy: SCHEMA_DEFINATION_PROPERTIES.requiredObjectId,
    },
    GENERAL_SCHEMA_OPTIONS
);

export default bloodCampSchema;
