import { HeartRateArbitrary } from "@fp-ts-playground/core";
import { sample } from "fast-check";
import { Producer } from "kafkajs";
import { interval } from "rxjs";
import { map } from "rxjs/operators";
import { Logger } from "../logger";

export class KafkaHealthMetricsProducer {
  public static readonly DEFAULT_TOPIC_NAME = "health_metrics";

  constructor(
    private kafkaProducer: Producer,
    private logger: Logger,
    private topicName = KafkaHealthMetricsProducer.DEFAULT_TOPIC_NAME,
    private emitRandomData = true,
  ) {}

  private healthData$ = interval(10000).pipe(
    map(() => sample(HeartRateArbitrary({ timestamp: new Date() }), 1)[0]),
  );

  private emitRandomDataHandler = async (data: any) => {
    try {
      await this.kafkaProducer.send({
        topic: this.topicName,
        messages: [{ value: JSON.stringify(data) }],
      });
      this.logger.info("Sent data", { data });
    } catch (error) {
      this.logger.error(
        "Something wrong happened while trying to run emitRandomData",
        { error },
      );
    }
  };

  public run = async () => {
    try {
      this.logger.info("Running kafka producer");
      if (this.emitRandomData) {
        this.healthData$.subscribe(this.emitRandomDataHandler);
      }
    } catch (error) {
      this.logger.error(
        "Something wrong happened while trying to run producer",
        { error },
      );
    }
  };
}
