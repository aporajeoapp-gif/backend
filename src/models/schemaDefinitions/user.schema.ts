// import { IUser } from "../@types/interfaces/user.interface";
import SCHEMA_DEFINATION_PROPERTIES from "../../constants/model/model.constant";
import { IUser } from "../../@types/interfaces/user.interface";
import { Schema } from "mongoose";
import { GENERAL_SCHEMA_OPTIONS } from "../../constants/model/schemaOption";

const userSchema = new Schema<IUser>(
  {
    name: {
      ...SCHEMA_DEFINATION_PROPERTIES.requiredString,
      minlength: 3,
      maxlength: 50,
      validate: {
        validator: function (value: string) {
          const regex = /^(?=.*[a-z])(?=.*[A-Z])[A-Za-z ]+$/;
          return regex.test(value);
        },
        message: "Name must have uppercase, lowercase and only alphabets",
      },
    },
    email: {
      ...SCHEMA_DEFINATION_PROPERTIES.requiredString,
      unique: true,
      lowercase: true,
      validate: {
        validator: function (email: string) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        },
        message: "Please provide a valid email address",
      },
    },
    password: SCHEMA_DEFINATION_PROPERTIES.requiredString,
    role: {
      type: String,
      required: true,
      trim: true,
      enum: ["admin", "coordinator", "member"],
      default: "member",
    },
    permissions: {
      type: [String],
      default: [],
    },
    avatar: SCHEMA_DEFINATION_PROPERTIES.optionalNullString,
    isEmailVerified: SCHEMA_DEFINATION_PROPERTIES.optionalBoolean,
    status: {
      type: String,
      enum: ["active", "deactive"],
      default: "active",
    },
  },

  GENERAL_SCHEMA_OPTIONS,
);

export default userSchema;
