import { Schema } from "mongoose";
import SCHEMA_DEFINATION_PROPERTIES from "../../constants/model/model.constant";
import { GENERAL_SCHEMA_OPTIONS } from "../../constants/model/schemaOption";
import { IAuditLog } from "../../@types/interfaces/auditLog.interface";

const auditLogSchema = new Schema<IAuditLog>(
  {
    user: {
      ...SCHEMA_DEFINATION_PROPERTIES.requiredObjectId,
      ref: "Users",
    },
    userName: SCHEMA_DEFINATION_PROPERTIES.requiredString,
    userEmail: SCHEMA_DEFINATION_PROPERTIES.requiredString,
    userRole: SCHEMA_DEFINATION_PROPERTIES.requiredString,
    action: SCHEMA_DEFINATION_PROPERTIES.requiredString,
    task: SCHEMA_DEFINATION_PROPERTIES.requiredString,
    details: SCHEMA_DEFINATION_PROPERTIES.requiredString,
    severity: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    payload: {
      oldData: { type: Schema.Types.Mixed, default: null },
      newData: { type: Schema.Types.Mixed, default: null },
    },
    entityId: SCHEMA_DEFINATION_PROPERTIES.optionalNullObjectId,
    entityModel: SCHEMA_DEFINATION_PROPERTIES.optionalNullString,
    ipAddress: SCHEMA_DEFINATION_PROPERTIES.optionalNullString,
    userAgent: SCHEMA_DEFINATION_PROPERTIES.optionalNullString,
    deviceName: SCHEMA_DEFINATION_PROPERTIES.optionalNullString,
    location: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },
  },
  GENERAL_SCHEMA_OPTIONS,
);


export default auditLogSchema;
