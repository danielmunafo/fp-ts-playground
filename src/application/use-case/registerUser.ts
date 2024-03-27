import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { User, UserRepositoryPort } from "../../core";
import { EmailInUseError } from "./errors";

export const registerUser =
  (userRepository: UserRepositoryPort) =>
  (userData: User): TE.TaskEither<Error, void> =>
    pipe(
      userRepository.findByEmail(userData.email),
      TE.chain(
        (optionUser) =>
          O.isNone(optionUser)
            ? userRepository.save(userData) // If no user is found, proceed with save
            : TE.left(new EmailInUseError("Email is already in use")), // If user exists, return error
      ),
    );
