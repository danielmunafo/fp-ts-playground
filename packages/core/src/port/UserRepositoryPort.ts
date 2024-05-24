import { Option } from "fp-ts/Option";
import { TaskEither } from "fp-ts/TaskEither";
import { User } from "../domain";

export type UserRepositoryPort = {
  save: (user: User) => TaskEither<Error, string>;
  findByEmail: (email: string) => TaskEither<Error, Option<User>>;
};
