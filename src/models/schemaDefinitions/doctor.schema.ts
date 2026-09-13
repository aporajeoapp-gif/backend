import SCHEMA_DEFINATION_PROPERTIES from "../../constants/model/model.constant";
import { IDoctor, IDoctorSchedule } from "../../@types/interfaces/doctor.interface";
import { Schema } from "mongoose";
import { GENERAL_SCHEMA_OPTIONS } from "../../constants/model/schemaOption";
const doctorScheduleSchema = new Schema<IDoctorSchedule>(
  {
    day: {
      type: String,
      required: false,
      trim: true,
    },
    time: {
      type: String,
      required: false,
      trim: true,
    },
    chamber: {
      type: String,
      required: false,
      trim: true,
    },
  },
  { _id: false }
);

const doctorSchema = new Schema<IDoctor>(
  {
    name: SCHEMA_DEFINATION_PROPERTIES.requiredString,
    specialty: SCHEMA_DEFINATION_PROPERTIES.requiredString,
    personalNo: SCHEMA_DEFINATION_PROPERTIES.optionalNullString,
    location: SCHEMA_DEFINATION_PROPERTIES.requiredString,
    phone: SCHEMA_DEFINATION_PROPERTIES.requiredString,
    alternatePhone: SCHEMA_DEFINATION_PROPERTIES.optionalNullString,
    degree: SCHEMA_DEFINATION_PROPERTIES.optionalNullString,
    experience: SCHEMA_DEFINATION_PROPERTIES.optionalNullNumber,
    medicalShopLocation: {
      address: SCHEMA_DEFINATION_PROPERTIES.optionalNullString,
      latitude: SCHEMA_DEFINATION_PROPERTIES.optionalNullNumber,
      longitude: SCHEMA_DEFINATION_PROPERTIES.optionalNullNumber,
    },
    email: SCHEMA_DEFINATION_PROPERTIES.optionalNullString,
    image: SCHEMA_DEFINATION_PROPERTIES.optionalNullString,

    schedule: {
      type: [doctorScheduleSchema],
      default: [],
    },

    createdBy: SCHEMA_DEFINATION_PROPERTIES.requiredString,
    creatorName: SCHEMA_DEFINATION_PROPERTIES.requiredString,
  },
  GENERAL_SCHEMA_OPTIONS
);

export default doctorSchema;
