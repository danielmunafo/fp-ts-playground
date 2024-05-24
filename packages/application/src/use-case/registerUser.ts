import { User, UserRepositoryPort } from "@fp-ts-playground/core";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { EmailInUseError } from "./errors";

export const registerUser =
  (userRepository: UserRepositoryPort) =>
  (userData: User): TE.TaskEither<Error, string> =>
    pipe(
      userRepository.findByEmail(userData.email),
      TE.chain((optionUser) =>
        O.isNone(optionUser)
          ? userRepository.save(userData)
          : TE.left(new EmailInUseError()),
      ),
    );
