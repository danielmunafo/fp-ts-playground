import { HeartRateArbitrary, HeartRateEntity } from "@fp-ts-playground/core";
import {
  HEART_RATE_SCHEMA_NAME,
  KafkaHealthMetricsProducer,
  SchemaRegistryManager,
  defaultLogger,
} from "@fp-ts-playground/infrastructure";
import { SchemaRegistry } from "@kafkajs/confluent-schema-registry";
import * as dotenv from "dotenv";
import { sample } from "fast-check";
import { isLeft } from "fp-ts/lib/Either";
import { Kafka, Partitioners } from "kafkajs";
import path from "path";
import { interval, map } from "rxjs";

dotenv.config({ path: path.resolve(__dirname, "../../config/.env") });

const DEFAULT_SCHEMA_REGISTRY_HOST = "http://localhost:8081";
const DEFAULT_BROKER = "localhost:9092";
const DEFAULT_CLIENT_ID = "health-producer";

(async () => {
  if (process.env.NODE_ENV !== "production") {
    process.env.KAFKAJS_NO_PARTITIONER_WARNING = "1";
  }

  const kafka = new Kafka({
    clientId: DEFAULT_CLIENT_ID,
    brokers: [DEFAULT_BROKER],
    retry: {
      retries: 5,
      initialRetryTime: 1000,
    },
    connectionTimeout: 25000,
  });
  const producer = kafka.producer({
    createPartitioner: Partitioners.LegacyPartitioner,
  });

  const shutdown = async () => {
    defaultLogger.info(
      "Received termination signal, shutting kafka producer down...",
    );

    try {
      await producer.disconnect();
      defaultLogger.info("Successfully disconnected kafka producer");
    } catch (error) {
      defaultLogger.error("Error occurred while disconnecting kafka producer", {
        error,
      });
    } finally {
      process.exit(0);
    }
  };
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);

  try {
    await producer.connect();

    const schemaRegistryManager = new SchemaRegistryManager(
      new SchemaRegistry({
        host: process.env.SCHEMA_REGISTRY_HOST || DEFAULT_SCHEMA_REGISTRY_HOST,
      }),
      defaultLogger,
    );
    await schemaRegistryManager.initialize();

    const schemaTask = schemaRegistryManager.getSchema(HEART_RATE_SCHEMA_NAME);
    const schema = await schemaTask();
    if (isLeft(schema)) {
      throw new Error("Invalid schema name");
    }
    const heartRateSchema = schema.right;

    const heartRate = new HeartRateEntity({
      ...sample(HeartRateArbitrary({ timestamp: new Date() }), 1)[0],
    });
    const fromDataBufferedValue = await heartRateSchema.encode({
      ...heartRate,
      timestamp: heartRate.timestamp.toISOString(),
    });
    const messagePayload = { value: fromDataBufferedValue };
    const result = await producer.send({
      topic: "health_metrics",
      messages: [messagePayload],
    });
    defaultLogger.info("Sent data", {
      result,
      messagePayload,
      fromDataBufferedValue,
    });

    const heartRateObservableGenerator = () =>
      new HeartRateEntity({
        ...sample(HeartRateArbitrary({ timestamp: new Date() }), 1)[0],
      });
    const POOL_TIME = 1000;
    const heartRateObservable$ = interval(POOL_TIME).pipe(
      map(heartRateObservableGenerator),
    );
    const producerMockRunTask = new KafkaHealthMetricsProducer<HeartRateEntity>(
      producer,
      defaultLogger,
      heartRateObservable$,
      heartRateSchema,
    ).run();
    await producerMockRunTask();
  } catch (error) {
    defaultLogger.error(
      "Something wrong happened while trying to run kafkaHealthMetricsProducer",
      { error },
    );
  }
})();
