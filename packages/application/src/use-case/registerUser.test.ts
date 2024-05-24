import { UserArbitrary } from "@fp-ts-playground/core";
import { InMemoryUserRepository } from "@fp-ts-playground/infrastructure";
import { assert, asyncProperty } from "fast-check";
import { isRight } from "fp-ts/Either";
import { getLeft, isSome } from "fp-ts/Option";
import { EmailInUseError } from "./errors";
import { registerUser } from "./registerUser";

describe("registerUser", () => {
  it("should successfully register a user", async () => {
    await assert(
      asyncProperty(UserArbitrary(), async (user) => {
        // Given a valid user
        const userRepository = new InMemoryUserRepository();
        const register = registerUser(userRepository);

        // When trying to register it
        const result = await register(user)();

        // Then the system should return success
        const success = isRight(result);
        expect(success).toBeTruthy();
      }),
      { numRuns: 20 },
    );
  });

  it("should not allow registering a user with an existing email", async () => {
    await assert(
      asyncProperty(UserArbitrary(), async (user) => {
        // Given an already registered user
        const userRepository = new InMemoryUserRepository();
        const register = registerUser(userRepository);

        const newUserResult = await register(user)();
        const firstRegisteringSuccess = isRight(newUserResult);
        expect(firstRegisteringSuccess).toBeTruthy();

        // When trying to register the same user
        const alreadyExistingUserEither = await register(user)();

        // Then the system should not register the user
        const leftOption = getLeft(alreadyExistingUserEither);
        if (isSome(leftOption)) {
          expect(leftOption.value).toBeInstanceOf(EmailInUseError);
        } else {
          expect(true).toBeFalsy();
        }
      }),
      { numRuns: 20 },
    );
  });
});
