import * as avro from "avsc";

export const HeartRateSchema = {
  type: "record",
  name: "HeartRate",
  fields: [
    { name: "userId", type: "string" },
    { name: "value", type: "int" },
    { name: "timestamp", type: "string" },
  ],
};

export const HeartRateAvroSchema = avro.Type.forSchema(Object(HeartRateSchema));
