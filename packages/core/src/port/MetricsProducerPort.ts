import { TaskEither } from "fp-ts/TaskEither";
import { RecordMetadata } from "kafkajs";
import { Entity } from "../domain/entities/Entity";

export interface MetricsProducerPort<I extends Entity> {
  sendMessage: (data: I) => TaskEither<Error, RecordMetadata[]>;
}
