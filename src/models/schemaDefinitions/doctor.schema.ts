import SCHEMA_DEFINATION_PROPERTIES from "../../constants/model/model.constant";
import { IDoctor } from "../../@types/interfaces/doctor.interface";
import { Schema } from "mongoose";
import { GENERAL_SCHEMA_OPTIONS } from "../../constants/model/schemaOption";

const doctorSchema = new Schema<IDoctor>(
    {
        name: SCHEMA_DEFINATION_PROPERTIES.requiredString,
        specialty: SCHEMA_DEFINATION_PROPERTIES.requiredString,
        experience: SCHEMA_DEFINATION_PROPERTIES.requiredNumber,
        location: SCHEMA_DEFINATION_PROPERTIES.requiredString,
        phone: SCHEMA_DEFINATION_PROPERTIES.requiredString,
        email: SCHEMA_DEFINATION_PROPERTIES.optionalNullString,
        image: SCHEMA_DEFINATION_PROPERTIES.optionalNullString,
        schedule: [
            {
                day: { type: String, required: true },
                time: { type: String, required: true },
                chamber: { type: String, required: true }
            }
        ],
        createdBy: SCHEMA_DEFINATION_PROPERTIES.requiredString,
        creatorName: SCHEMA_DEFINATION_PROPERTIES.requiredString,
    },
    GENERAL_SCHEMA_OPTIONS
);

export default doctorSchema;
