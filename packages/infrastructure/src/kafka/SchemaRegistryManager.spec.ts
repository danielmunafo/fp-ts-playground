import { SchemaRegistry, SchemaType } from "@kafkajs/confluent-schema-registry";
import { isLeft, isRight, left, right } from "fp-ts/Either";
import { TaskEither } from "fp-ts/TaskEither";
import { debugLogger } from "../logger";
import { SchemaRegistryManager } from "./SchemaRegistryManager";
import { AvroConfluentSchema } from "./schemas";

describe("SchemaRegistryManager", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("registerSchema", () => {
    it("should register a schema successfully", async () => {
      const schema: AvroConfluentSchema = {
        type: "record",
        name: "TestSchema",
        fields: [{ name: "field1", type: "string" }],
      };
      const schemaRegistry = new SchemaRegistry({ host: "will-not-connect" });
      const schemaRegistrySpy = jest
        .spyOn(schemaRegistry, "register")
        .mockResolvedValue({ id: 1 });
      const schemaRegistryManager = new SchemaRegistryManager(
        schemaRegistry,
        debugLogger,
      );

      const result: TaskEither<Error, number> =
        schemaRegistryManager.registerSchema(schema);
      const either = await result();

      expect(either).toEqual(right(1));
      expect(schemaRegistrySpy).toHaveBeenCalledWith({
        schema,
        type: SchemaType.AVRO,
      });
      const fetchedSchema =
        await schemaRegistryManager.getSchema("TestSchema")();
      expect(isRight(fetchedSchema) ? fetchedSchema.right.id : 0).toBe(1);
    });

    it("should handle errors during schema registration", async () => {
      const schema: AvroConfluentSchema = {
        type: "record",
        name: "TestSchema",
        fields: [{ name: "field1", type: "string" }],
      };
      const schemaRegistry = new SchemaRegistry({ host: "will-not-connect" });
      const genericError = new Error("Failed to register schema");
      const schemaRegistrySpy = jest
        .spyOn(schemaRegistry, "register")
        .mockRejectedValue(genericError);
      const schemaRegistryManager = new SchemaRegistryManager(
        schemaRegistry,
        debugLogger,
      );

      const result: TaskEither<Error, number> =
        schemaRegistryManager.registerSchema(schema);
      const either = await result();

      expect(either).toEqual(left(genericError));
      expect(schemaRegistrySpy).toHaveBeenCalledWith({
        schema,
        type: SchemaType.AVRO,
      });
      const fetchedSchema =
        await schemaRegistryManager.getSchema("TestSchema")();
      expect(
        isLeft(fetchedSchema) ? fetchedSchema.left : undefined,
      ).toBeDefined();
    });
  });
});
