import { TaskEither } from "fp-ts/TaskEither";
import { Entity } from "../domain/entities/Entity";

export interface MetricsProducerPort<I extends Entity> {
  run: () => TaskEither<Error, void>;
}
