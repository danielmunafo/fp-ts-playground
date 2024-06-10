import { AvroConfluentSchema } from "./types";

export const HEART_RATE_SCHEMA_NAME = "HeartRate";
export const HeartRateRecordedSchema: AvroConfluentSchema = {
  namespace: "smart_health",
  name: HEART_RATE_SCHEMA_NAME,
  type: "record",
  fields: [
    { name: "userId", type: "string" },
    { name: "value", type: "int" },
    { name: "timestamp", type: "string" },
  ],
};
