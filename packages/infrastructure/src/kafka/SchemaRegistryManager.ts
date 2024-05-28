import { SchemaRegistry, SchemaType } from "@kafkajs/confluent-schema-registry";
import { TaskEither, tryCatch } from "fp-ts/TaskEither";

export interface AvroConfluentSchema {
  type: SchemaType.AVRO;
  schema: {
    name: string;
    namespace?: string;
    type: "record";
    fields: any[];
  };
}

export class SchemaRegistryManager {
  private schemaRegistry: SchemaRegistry;
  private registeredSchemas: Map<string, number>;

  constructor(schemaRegistry: SchemaRegistry) {
    this.schemaRegistry = schemaRegistry;
    this.registeredSchemas = new Map<string, number>();
  }

  registerSchema(schema: AvroConfluentSchema): TaskEither<Error, number> {
    return tryCatch(
      async () => {
        const { id } = await this.schemaRegistry.register(schema);
        this.registeredSchemas.set(schema.schema.name, id);
        return id;
      },
      (error) => new Error("Failed to register schema", { cause: error }),
    );
  }

  getSchemaId(name: string): TaskEither<Error, number> {
    return tryCatch(
      async () => {
        const id = this.registeredSchemas.get(name);
        if (id === undefined) {
          throw new Error(`Schema ID not found for schema: ${name}`);
        }
        return id;
      },
      (error) => new Error("Failed to register schema", { cause: error }),
    );
  }
}
