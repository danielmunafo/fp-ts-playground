import { Option } from "fp-ts/lib/Option";
import { TaskEither } from "fp-ts/lib/TaskEither";
import { User } from "../domain";

export type UserRepositoryPort = {
  save: (user: User) => TaskEither<Error, void>;
  findByEmail: (email: string) => TaskEither<Error, Option<User>>;
};
