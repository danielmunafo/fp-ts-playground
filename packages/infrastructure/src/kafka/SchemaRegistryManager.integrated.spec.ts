import { SchemaRegistry } from "@kafkajs/confluent-schema-registry";
import * as dotenv from "dotenv";
import { isLeft } from "fp-ts/Either";
import * as path from "path";
import logger from "../logger/logger";
import { SchemaRegistryManager } from "./SchemaRegistryManager";
import { HEART_RATE_SCHEMA_NAME } from "./schemas";

dotenv.config({
  path: path.resolve(__dirname, "../../../../config/.env.test"),
});

describe("SchemaRegistryManager Integration tests", () => {
  it("should register a schema", async () => {
    const schemaRegistryParams = {
      host: `${process.env.SCHEMA_REGISTRY_CLIENT_HOST}:${process.env.SCHEMA_REGISTRY_CLIENT_PORT}`,
    };
    const schemaRegistryManager = new SchemaRegistryManager(
      new SchemaRegistry(schemaRegistryParams),
      logger,
    );
    await schemaRegistryManager.initialize();

    const schemaTask = schemaRegistryManager.getSchema(HEART_RATE_SCHEMA_NAME);
    const schema = await schemaTask();
    expect(isLeft(schema)).toBeFalsy();
    if (isLeft(schema)) {
      throw new Error("Expected no error when registering schema");
    }
    const heartRateSchema = schema.right;
    expect(heartRateSchema).not.toBeUndefined();
    expect(heartRateSchema).not.toBeNull();
  });
});
