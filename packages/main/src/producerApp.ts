import { HeartRateArbitrary, HeartRateEntity } from "@fp-ts-playground/core";
import {
  DateType,
  HEART_RATE_SCHEMA_NAME,
  KafkaEntityProducer,
  SchemaRegistryManager,
  defaultLogger,
} from "@fp-ts-playground/infrastructure";
import { SchemaRegistry, SchemaType } from "@kafkajs/confluent-schema-registry";
import * as dotenv from "dotenv";
import { sample } from "fast-check";
import { Right, isLeft } from "fp-ts/lib/Either";
import { Kafka, Partitioners, Producer, RecordMetadata } from "kafkajs";
import path from "path";
import { range, timer } from "rxjs";
import { concatMap, finalize, map } from "rxjs/operators";

dotenv.config({ path: path.resolve(__dirname, "../../../config/.env.local") });

const DEFAULT_CLIENT_ID = "health-producer";

const KAFKA_BROKER = `${process.env.KAFKA_CLIENT_HOST}:${process.env.KAFKA_CLIENT_PORT}`;
const kafkaParameters = {
  clientId: DEFAULT_CLIENT_ID,
  brokers: [KAFKA_BROKER],
  retry: {
    retries: 5,
    initialRetryTime: 1000,
  },
  connectionTimeout: 25000,
};
const schemaRegistryParams = {
  host: `${process.env.SCHEMA_REGISTRY_CLIENT_HOST}:${process.env.SCHEMA_REGISTRY_CLIENT_PORT}`,
};
const schemaRegistryOptions = {
  [SchemaType.AVRO]: {
    logicalTypes: { "timestamp-millis": DateType },
  },
};
const DEFAULT_PARAMETERS = {
  kafka: new Kafka(kafkaParameters),
  iterations: 1000,
  schemaRegistryManager: new SchemaRegistryManager(
    new SchemaRegistry(schemaRegistryParams, schemaRegistryOptions),
    defaultLogger,
  ),
  schemaName: HEART_RATE_SCHEMA_NAME,
};

const shutdown = async (producer: Producer) => {
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

export const producerApp = async ({
  kafka,
  iterations,
  schemaRegistryManager,
  schemaName,
} = DEFAULT_PARAMETERS) => {
  if (process.env.NODE_ENV !== "production") {
    process.env.KAFKAJS_NO_PARTITIONER_WARNING = "1";
  }

  const producer = kafka.producer({
    createPartitioner: Partitioners.LegacyPartitioner,
  });
  process.on("SIGTERM", () => shutdown(producer));
  process.on("SIGINT", () => shutdown(producer));

  try {
    await producer.connect();
    await schemaRegistryManager.initialize();
    const schemaTask = schemaRegistryManager.getSchema(schemaName);
    const registeredSchema = await schemaTask();
    if (isLeft(registeredSchema)) {
      throw new Error("Invalid schema name");
    }
    const schema = registeredSchema.right;

    const kafkaEntityProducer = new KafkaEntityProducer(
      producer,
      defaultLogger,
      schema,
      "heart_rate",
    );

    const source$ = range(0, iterations).pipe(
      concatMap((i) =>
        timer(i * 5000).pipe(
          // Delay each message by 5 seconds
          map(
            () => sample(HeartRateArbitrary({ timestamp: new Date() }), 1)[0],
          ),
          map(
            (heartRateArbitrary) =>
              new HeartRateEntity({
                ...heartRateArbitrary,
              }),
          ),
          concatMap((heartRate) =>
            kafkaEntityProducer.sendMessage(heartRate)(),
          ),
        ),
      ),
      finalize(() => {
        producer.disconnect();
      }),
    );

    // Subscribe to the observable
    source$.subscribe({
      next: (result) =>
        defaultLogger.info("Sent data", {
          result: (result as Right<RecordMetadata[]>).right,
        }),
      error: (error) => defaultLogger.error("Error in data stream", { error }),
      complete: () => defaultLogger.info("Completed sending data"),
    });
  } catch (error) {
    throw new Error("producerApp failed to run.", { cause: error });
  }
};

producerApp();
