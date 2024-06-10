import {
  Entity,
  HeartRateArbitrary,
  HeartRateEntity,
  MetricsProducerPort,
  Schema,
} from "@fp-ts-playground/core";
import { sample } from "fast-check";
import { TaskEither, tryCatch } from "fp-ts/TaskEither";
import { isLeft } from "fp-ts/lib/Either";
import { Producer, RecordMetadata } from "kafkajs";
import { Observable, interval, map } from "rxjs";
import { Logger } from "../logger";

export class KafkaHealthMetricsProducer<E extends Entity>
  implements MetricsProducerPort<E>
{
  public static readonly DEFAULT_TOPIC_NAME = "health_metrics";

  constructor(
    private kafkaProducer: Producer,
    private logger: Logger,
    private observableEmitter: Observable<E>,
    private schema: Schema,
    private topicName = KafkaHealthMetricsProducer.DEFAULT_TOPIC_NAME,
  ) {}

  public async emitData(data: E): Promise<TaskEither<Error, RecordMetadata[]>> {
    return tryCatch(
      async () => {
        const validationResult = data.validate();
        if (isLeft(validationResult)) {
          throw new Error(
            `Invalid data provided to emitData. ${validationResult.left.map((e) => e.message).join(";")}`,
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
          messagePayload,
          fromDataBufferedValue,
        });
        return result;
      },
      (error) => {
        const message = "Something wrong happened on emitData";
        this.logger.error(message, { error });
        return new Error(message, { cause: { error } });
      },
    );
  }

  public run(): TaskEither<Error, void> {
    return tryCatch(
      async () => {
        this.logger.info("Running kafka producer");

        interval(10000)
          .pipe(
            map(
              () => sample(HeartRateArbitrary({ timestamp: new Date() }), 1)[0],
            ),
            map((arb) => new HeartRateEntity({ ...arb }) as any),
          )
          .subscribe(this.emitData);

        this.observableEmitter.subscribe(this.emitData);
      },
      (error) => {
        const message = "Something wrong happened while trying to run producer";
        this.logger.error(message, { error });
        return new Error(message, { cause: { error } });
      },
    );
  }
}
