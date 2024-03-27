import { Option, none, some } from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import { User, UserRepositoryPort } from "../../core";

export class InMemoryUserRepository implements UserRepositoryPort {
  private users: User[] = [];
  public static USER_ALREADY_EXISTS_MESSAGE = "User already exists";

  save = (user: User): TE.TaskEither<Error, void> =>
    TE.tryCatch(
      () => {
        const existingUser = this.users.find((u) => u.email === user.email);
        if (existingUser) {
          throw new Error(InMemoryUserRepository.USER_ALREADY_EXISTS_MESSAGE);
        }
        this.users.push(user);
        return Promise.resolve();
      },
      (reason: unknown) =>
        new Error(
          `Failed to save user: ${reason instanceof Error ? reason.message : String(reason)}`,
        ),
    );

  findByEmail = (email: string): TE.TaskEither<Error, Option<User>> =>
    TE.right(
      this.users.reduce<Option<User>>(
        (acc, user) => (user.email === email ? some(user) : acc),
        none,
      ),
    );
}
