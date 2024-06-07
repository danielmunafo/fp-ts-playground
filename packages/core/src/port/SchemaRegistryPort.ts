import { SchemaRegistry } from "@kafkajs/confluent-schema-registry";
import { TaskEither } from "fp-ts/TaskEither";

export type Schema = {
  encode: (data: unknown) => Promise<Buffer>;
  decode: SchemaRegistry["decode"];
  id: number;
};

export interface SchemaRegistryPort {
  registerSchema(schema: Record<string, unknown>): TaskEither<Error, number>;
  getSchema(name: string): TaskEither<Error, Schema>;
  initialize(schemas?: Record<string, unknown>[]): Promise<void>;
}
