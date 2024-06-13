import { HeartRateArbitrary, HeartRateEntity } from "@fp-ts-playground/core";
import { SchemaRegistry, SchemaType } from "@kafkajs/confluent-schema-registry";
import * as dotenv from "dotenv";
import { sample } from "fast-check";
import { isLeft } from "fp-ts/Either";
import { Kafka, Partitioners } from "kafkajs";
import * as path from "path";
import logger from "../logger/logger";
import { KafkaEntityProducer } from "./KafkaEntityProducer";
import { SchemaRegistryManager } from "./SchemaRegistryManager";
import { DateType, HEART_RATE_SCHEMA_NAME } from "./schemas";

dotenv.config({
  path: path.resolve(__dirname, "../../../../config/.env.test"),
});

describe("KafkaEntityProducer Integration tests", () => {
  const schemaRegistryOptions = {
    [SchemaType.AVRO]: {
      logicalTypes: { "timestamp-millis": DateType },
    },
  };

  // GIVEN schema registry working
  const schemaRegistryParams = {
    host: `${process.env.SCHEMA_REGISTRY_CLIENT_HOST}:${process.env.SCHEMA_REGISTRY_CLIENT_PORT}`,
  };
  const schemaRegistryManager = new SchemaRegistryManager(
    new SchemaRegistry(schemaRegistryParams, schemaRegistryOptions),
    logger,
  );

  // GIVEN kafka client working
  const KAFKA_BROKER = `${process.env.KAFKA_CLIENT_HOST}:${process.env.KAFKA_CLIENT_PORT}`;
  const kafkaParameters = {
    clientId: "test-producer",
    brokers: [KAFKA_BROKER],
    retry: {
      retries: 5,
      initialRetryTime: 1000,
    },
    connectionTimeout: 25000,
  };
  logger.debug("Kafka Client", kafkaParameters);
  const kafka = new Kafka(kafkaParameters);
  const producer = kafka.producer({
    createPartitioner: Partitioners.LegacyPartitioner,
  });

  afterAll(async () => {
    await producer.disconnect();
  });

  it("should produce a message", async () => {
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

    await producer.connect();
    const heartRate = new HeartRateEntity({
      ...sample(HeartRateArbitrary({ timestamp: new Date() }), 1)[0],
    });

    // GIVEN a valid entity producer
    const kafkaEntityProducer = new KafkaEntityProducer<HeartRateEntity>(
      producer,
      logger,
      heartRateSchema,
      "test-topic",
    );

    // WHEN message is sent
    const result = await kafkaEntityProducer.sendMessage(heartRate)();
    if (isLeft(result)) {
      throw new Error("Error shouldn't have happened.", { cause: result.left });
    }

    // THEN the result should be equal this:
    expect(result.right).toEqual([
      {
        topicName: "test-topic",
        partition: 0,
        errorCode: 0,
        baseOffset: "0",
        logAppendTime: "-1",
        logStartOffset: "0",
      },
    ]);
  });
});
