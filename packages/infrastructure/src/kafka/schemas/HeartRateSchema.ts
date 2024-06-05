import { AvroConfluentSchema } from "./types";

export const HeartRateRecordedSchema: AvroConfluentSchema = {
  namespace: "smart-health",
  name: "HeartRate",
  type: "record",
  fields: [
    { name: "userId", type: "string" },
    { name: "value", type: "int" },
    { name: "timestamp", type: "string" },
  ],
};
