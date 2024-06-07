import { Schema, SchemaRegistryPort } from "@fp-ts-playground/core";
import { SchemaRegistry, SchemaType } from "@kafkajs/confluent-schema-registry";
import { TaskEither, tryCatch } from "fp-ts/TaskEither";
import { isLeft } from "fp-ts/lib/Either";
import { Logger } from "../logger";
import { AvroConfluentSchema, HeartRateRecordedSchema } from "./schemas";

export class SchemaRegistryManager implements SchemaRegistryPort {
  private registeredSchemas: Map<string, number> = new Map<string, number>();

  constructor(
    private schemaRegistry: SchemaRegistry,
    private logger: Logger,
  ) {}

  async initialize(schemas = [HeartRateRecordedSchema]): Promise<void> {
    for (let i = 0; i < schemas.length; i++) {
      try {
        const schema = schemas[i];
        const registeredSchema = await this.registerSchema(schema)();
        if (isLeft(registeredSchema)) {
          throw new Error("Could not register schema", {
            cause: registeredSchema.left,
          });
        }
        this.logger.debug("Registered schema", {
          schema,
          registeredSchema: registeredSchema.right,
        });
      } catch (error) {
        throw new Error("Could not register schema", { cause: error });
      }
    }
  }

  registerSchema(schema: AvroConfluentSchema): TaskEither<Error, number> {
    return tryCatch(
      async () => {
        const { id } = await this.schemaRegistry.register({
          type: SchemaType.AVRO,
          schema: JSON.stringify(schema),
        });
        this.registeredSchemas.set(schema.name, id);
        return id;
      },
      (error) => new Error("Failed to register schema", { cause: error }),
    );
  }

  getSchema(name: string): TaskEither<Error, Schema> {
    return tryCatch(
      async () => {
        const id = this.registeredSchemas.get(name);
        if (id === undefined) {
          throw new Error(`Schema ID not found for schema: ${name}`);
        }

        return {
          id,
          encode: (data: unknown) => this.schemaRegistry.encode(id, data),
          decode: this.schemaRegistry.decode,
        };
      },
      (error) => new Error("Failed to get schema", { cause: error }),
    );
  }
}
