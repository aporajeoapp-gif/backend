import SCHEMA_DEFINATION_PROPERTIES from "../../constants/model/model.constant";
import { IEvent } from "../../@types/interfaces/event.interface";
import { Schema } from "mongoose";
import { GENERAL_SCHEMA_OPTIONS } from "../../constants/model/schemaOption";

const eventSchema = new Schema<IEvent>(
    {
        title: SCHEMA_DEFINATION_PROPERTIES.requiredString,
        description: SCHEMA_DEFINATION_PROPERTIES.requiredString,
        date: SCHEMA_DEFINATION_PROPERTIES.requiredDate,
        time: SCHEMA_DEFINATION_PROPERTIES.requiredString,
        location: SCHEMA_DEFINATION_PROPERTIES.requiredString,
        organizer: SCHEMA_DEFINATION_PROPERTIES.requiredString,
        image: SCHEMA_DEFINATION_PROPERTIES.optionalNullString,
        status: {
            type: String,
            required: true,
            trim: true,
            enum: ["upcoming", "ongoing", "completed"],
            default: "upcoming"
        },
        createdBy: SCHEMA_DEFINATION_PROPERTIES.requiredString,
    },
    GENERAL_SCHEMA_OPTIONS
);

export default eventSchema;
