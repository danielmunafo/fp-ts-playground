import {
  KafkaHealthMetricsProducer,
  defaultLogger,
} from "@fp-ts-playground/infrastructure";
import * as dotenv from "dotenv";
import { Kafka, Partitioners } from "kafkajs";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../config/.env") });

const DEFAULT_BROKER = "localhost:9092";
const DEFAULT_CLIENT_ID = "health-producer";

(async () => {
  if (process.env.NODE_ENV !== "production") {
    process.env.KAFKAJS_NO_PARTITIONER_WARNING = "1";
  }

  const kafka = new Kafka({
    clientId: DEFAULT_CLIENT_ID,
    brokers: [process.env.KAFKA_BROKER || DEFAULT_BROKER],
    retry: {
      retries: 5,
      initialRetryTime: 300,
    },
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
    const kafkaHealthMetricsProducer = new KafkaHealthMetricsProducer(
      producer,
      defaultLogger,
    );

    await kafkaHealthMetricsProducer.run();
  } catch (error) {
    defaultLogger.error(
      "Something wrong happened while trying to run kafkaHealthMetricsProducer",
      { error },
    );
  }
})();
