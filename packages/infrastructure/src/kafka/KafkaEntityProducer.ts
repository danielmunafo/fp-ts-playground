import { Entity, MetricsProducerPort, Schema } from "@fp-ts-playground/core";
import { TaskEither, tryCatch } from "fp-ts/TaskEither";
import { isLeft } from "fp-ts/lib/Either";
import { Producer, RecordMetadata } from "kafkajs";
import { Logger } from "../logger";

export class KafkaEntityProducer<E extends Entity>
  implements MetricsProducerPort<E>
{
  public static readonly DEFAULT_TOPIC_NAME = "health_metrics";

  constructor(
    private kafkaProducer: Producer,
    private logger: Logger,
    private schema: Schema,
    private topicName = KafkaEntityProducer.DEFAULT_TOPIC_NAME,
  ) {}

  public sendMessage(data: E): TaskEither<Error, RecordMetadata[]> {
    return tryCatch(
      async () => {
        const validationResult = data.validate();
        if (isLeft(validationResult)) {
          throw new Error(
            `Invalid data provided to sendMessage. ${validationResult.left.map((e) => e.message).join(";")}`,
          );
        }

        const fromDataBufferedValue = await this.schema.encode(data);
        const messagePayload = { value: fromDataBufferedValue };
        const result = await this.kafkaProducer.send({
          topic: this.topicName,
          messages: [messagePayload],
        });
        this.logger.debug("Sent data", {
          data,
        });
        return result;
      },
      (error) => {
        return new Error("Something wrong happened on sendMessage", {
          cause: { error },
        });
      },
    );
  }
}
