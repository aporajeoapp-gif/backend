import { SchemaDefinitionProperty,Types } from "mongoose";

const requiredString: SchemaDefinitionProperty<string> = {
    type: String,
    required: true,
    trim: true,
};
const optionalNullString: SchemaDefinitionProperty<string | null> = {
    type: String,
    required: false,
    trim: true,
    default: null,
};

const requiredNumber: SchemaDefinitionProperty<number> = {
    type: Number,
    required: true,
};

const optionalNullNumber: SchemaDefinitionProperty<number | null> = {
    type: Number,
    required: false,
    default: null,
};

const requiredBoolean: SchemaDefinitionProperty<boolean> = {
    type: Boolean,
    required: true,
    default: false,
};
const optionalBoolean: SchemaDefinitionProperty<boolean> = {
   type: Boolean,
  required: true,          // 👈 IMPORTANT
  default: false,
  set: (value: boolean | null | undefined) => {
    if (value === null || value === undefined) {
      return false;
    }
    return value;
  },
  
};

const requiredDate: SchemaDefinitionProperty<Date> = {
    type: Date,
    required: true,
    default: Date.now,
};
const optionalDate: SchemaDefinitionProperty<Date | null> = {
    type: Date,
    required: false,
    default: null,
};
const requiredObjectId: SchemaDefinitionProperty<Types.ObjectId> = {
    type: Types.ObjectId,
    required: true,
};
const optionalNullObjectId: SchemaDefinitionProperty<Types.ObjectId | null> = {
    type: Types.ObjectId,
    required: false,
    default: null,
};

const requiredArrayObjectId: SchemaDefinitionProperty<Types.ObjectId[]> = {
    type: [Types.ObjectId],
    required: true,
    default: [],
};

const optionalArrayObjectId: SchemaDefinitionProperty<Types.ObjectId[] | null> = {
    type: [Types.ObjectId],
    required: false,
    default: null,
};

const ROLES = ["admin", "coordinator", "member"] as const;
type Role = (typeof ROLES)[number];

const PERMISSIONS = [
  "bus.create", "bus.read", "bus.update", "bus.delete",
  "ferry.create", "ferry.read", "ferry.update", "ferry.delete",
  "doctor.create", "doctor.read", "doctor.update", "doctor.delete",
  "emergency.create", "emergency.read", "emergency.update", "emergency.delete",
  "event.create", "event.read", "event.update", "event.delete",
  "ads.create", "ads.read", "ads.update", "ads.delete",
  "users.create", "users.read", "users.update", "users.delete",
  "blood.create", "blood.read", "blood.update", "blood.delete",
  "*"
] as const;
type Permission = (typeof PERMISSIONS)[number];

const CAMP_STATUS = ["upcoming", "ongoing", "completed"] as const;
type CampStatus = (typeof CAMP_STATUS)[number];

const EVENT_STATUS = ["upcoming", "ongoing", "completed"] as const;
type EventStatus = (typeof EVENT_STATUS)[number];

const ADS_STATUS = ["active", "expired", "pending"] as const;
type AdsStatus = (typeof ADS_STATUS)[number];

const SchemaDefinitionProperty = {
    requiredString,
    optionalNullString,
    requiredNumber,
    optionalNullNumber,
    requiredBoolean,
    optionalBoolean,
    requiredDate,
    optionalDate,
    requiredObjectId,
    optionalNullObjectId,
    requiredArrayObjectId,
    optionalArrayObjectId,
};

export { ROLES, Role, PERMISSIONS, Permission, CAMP_STATUS, CampStatus, EVENT_STATUS, EventStatus, ADS_STATUS, AdsStatus };
const SCHEMA_DEFINATION_PROPERTIES=SchemaDefinitionProperty ;

export default SCHEMA_DEFINATION_PROPERTIES;
