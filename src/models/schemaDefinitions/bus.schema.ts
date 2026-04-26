import SCHEMA_DEFINATION_PROPERTIES from "../../constants/model/model.constant";
import { IBusRoute } from "../../@types/interfaces/bus.interface";
import { Schema } from "mongoose";
import { GENERAL_SCHEMA_OPTIONS } from "../../constants/model/schemaOption";

const busSchema = new Schema<IBusRoute>(
  {
    busName: SCHEMA_DEFINATION_PROPERTIES.optionalNullString,
    routeName: {
      type: [String],
      required: true,
      default: [],
    },
    stops: {
      type: [String],
      required: true,
      default: [],
    },
    timings: {
      type: [
        {
          departure: { type: String, required: true },
          arrival: { type: String, required: true },
        },
      ],
      required: true,
      default: [],
    },
    fare: SCHEMA_DEFINATION_PROPERTIES.requiredNumber,
    createdBy: SCHEMA_DEFINATION_PROPERTIES.requiredString,
    creatorName: SCHEMA_DEFINATION_PROPERTIES.requiredString,
  },
  GENERAL_SCHEMA_OPTIONS,
);

export default busSchema;
