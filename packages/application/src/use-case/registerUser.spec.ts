import {
  User,
  UserArbitrary,
  UserRepositoryPort,
} from "@fp-ts-playground/core";
import { assert, asyncProperty } from "fast-check";
import { isRight, right } from "fp-ts/Either";
import { Option, none } from "fp-ts/Option";
import { TaskEither } from "fp-ts/lib/TaskEither";
import { registerUser } from "./registerUser";

const mockFindByEmailNone: TaskEither<Error, Option<User>> = async () =>
  right(none);
const mockSave: TaskEither<Error, string> = async () => right("ok");

describe("registerUser", () => {
  let userRepositoryMock: jest.Mocked<UserRepositoryPort> = {
    save: jest.fn(),
    findByEmail: jest.fn(),
  };
  it("should successfully register a user", async () => {
    await assert(
      asyncProperty(UserArbitrary(), async (user) => {
        userRepositoryMock.findByEmail.mockReturnValue(mockFindByEmailNone);
        userRepositoryMock.save.mockReturnValue(mockSave);
        // Given a valid user
        const register = registerUser(userRepositoryMock);

        // When trying to register it
        const result = await register(user)();

        // Then the system should return success
        const success = isRight(result);
        expect(success).toBeTruthy();
        expect(userRepositoryMock.findByEmail).toHaveBeenCalledWith(user.email);
        expect(userRepositoryMock.save).toHaveBeenCalledWith(user);
      }),
      { numRuns: 20 },
    );
  });
});
