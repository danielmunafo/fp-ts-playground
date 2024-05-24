import { User, UserRepositoryPort } from "@fp-ts-playground/core";
import { Option, none, some } from "fp-ts/Option";
import { TaskEither, right, tryCatch } from "fp-ts/TaskEither";

export enum SaveResult {
  Update = "update",
  Create = "create",
}

export class InMemoryUserRepository implements UserRepositoryPort {
  private users: Map<string, User> = new Map();

  save = (user: User): TaskEither<Error, SaveResult> =>
    tryCatch(
      async () => {
        const userEmail = user.email;
        const existingUser = this.users.get(userEmail);
        const message = existingUser ? SaveResult.Create : SaveResult.Update;
        this.users.set(userEmail, user);
        return message;
      },
      (reason: unknown) =>
        new Error(
          `Failed to save user: ${reason instanceof Error ? reason.message : String(reason)}`,
        ),
    );

  findByEmail = (email: string): TaskEither<Error, Option<User>> => {
    const user = this.users.get(email);
    return right(user ? some(user) : none);
  };
}
