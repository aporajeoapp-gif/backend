import SCHEMA_DEFINATION_PROPERTIES from "../../constants/model/model.constant";
import { IBusRoute } from "../../@types/interfaces/bus.interface";
import { Schema } from "mongoose";
import { GENERAL_SCHEMA_OPTIONS } from "../../constants/model/schemaOption";

const busSchema = new Schema<IBusRoute>(
    {
        busName: SCHEMA_DEFINATION_PROPERTIES.requiredString,
        routeNumber: SCHEMA_DEFINATION_PROPERTIES.requiredString,
        startPoint: SCHEMA_DEFINATION_PROPERTIES.requiredString,
        endPoint: SCHEMA_DEFINATION_PROPERTIES.requiredString,
        stops: {
            type: [String],
            required: true,
            default: []
        },
        timings: {
            type: [String],
            required: true,
            default: []
        },
        fare: SCHEMA_DEFINATION_PROPERTIES.requiredNumber,
        createdBy: SCHEMA_DEFINATION_PROPERTIES.requiredString,
    },
    GENERAL_SCHEMA_OPTIONS
);

export default busSchema;
