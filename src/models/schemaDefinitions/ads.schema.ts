import SCHEMA_DEFINATION_PROPERTIES from "../../constants/model/model.constant";
import { IAdvertisement } from "../../@types/interfaces/ads.interface";
import { Schema } from "mongoose";
import { GENERAL_SCHEMA_OPTIONS } from "../../constants/model/schemaOption";

const adsSchema = new Schema<IAdvertisement>(
    {
        title: SCHEMA_DEFINATION_PROPERTIES.requiredString,
        description: SCHEMA_DEFINATION_PROPERTIES.requiredString,
        image: SCHEMA_DEFINATION_PROPERTIES.requiredString,
        link: SCHEMA_DEFINATION_PROPERTIES.optionalNullString,
        startDate: SCHEMA_DEFINATION_PROPERTIES.requiredDate,
        endDate: SCHEMA_DEFINATION_PROPERTIES.requiredDate,
        status: {
            type: String,
            required: true,
            trim: true,
            enum: ["active", "expired", "pending"],
            default: "pending"
        },
        createdBy: SCHEMA_DEFINATION_PROPERTIES.requiredString,
    },
    GENERAL_SCHEMA_OPTIONS
);

export default adsSchema;
