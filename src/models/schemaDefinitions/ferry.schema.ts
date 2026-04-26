import SCHEMA_DEFINATION_PROPERTIES from "../../constants/model/model.constant";
import { IFerryRoute } from "../../@types/interfaces/ferry.interface";
import { Schema } from "mongoose";
import { GENERAL_SCHEMA_OPTIONS } from "../../constants/model/schemaOption";

const ferrySchema = new Schema<IFerryRoute>(
  {
    ferryName: SCHEMA_DEFINATION_PROPERTIES.optionalNullString,
    // route: SCHEMA_DEFINATION_PROPERTIES.requiredString,
    // startPoint: SCHEMA_DEFINATION_PROPERTIES.requiredString,
    // endPoint: SCHEMA_DEFINATION_PROPERTIES.requiredString,
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

export default ferrySchema;
