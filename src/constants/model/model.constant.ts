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
const SCHEMA_DEFINATION_PROPERTIES=SchemaDefinitionProperty ;

export default SCHEMA_DEFINATION_PROPERTIES;
