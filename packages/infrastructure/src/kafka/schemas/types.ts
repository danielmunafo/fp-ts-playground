export type AvroConfluentSchema = {
  name: string;
  namespace?: string;
  type: "record";
  fields: any[];
};
