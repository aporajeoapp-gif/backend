import SCHEMA_DEFINATION_PROPERTIES from "../../constants/model/model.constant";
import { IDonor } from "../../@types/interfaces/blood.interface";
import { Schema } from "mongoose";
import { GENERAL_SCHEMA_OPTIONS } from "../../constants/model/schemaOption";

const donorSchema = new Schema<IDonor>(
    {
        campId: SCHEMA_DEFINATION_PROPERTIES.requiredObjectId,
        name: SCHEMA_DEFINATION_PROPERTIES.requiredString,
        bloodGroup: SCHEMA_DEFINATION_PROPERTIES.requiredString,
        age: SCHEMA_DEFINATION_PROPERTIES.requiredNumber,
        phone: SCHEMA_DEFINATION_PROPERTIES.requiredString,
        donatedAt: SCHEMA_DEFINATION_PROPERTIES.optionalDate,
    },
    GENERAL_SCHEMA_OPTIONS
);

export default donorSchema;
