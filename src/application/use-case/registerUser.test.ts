import * as fc from "fast-check";
import { isLeft, isRight } from "fp-ts/lib/Either";
import { InMemoryUserRepository } from "../../infrastructure";
import { UserArbitrary } from "../../test";
import { registerUser } from "./registerUser";

describe("registerUser", () => {
  it("should successfully register a user", async () => {
    await fc.assert(
      fc.asyncProperty(UserArbitrary(), async (user) => {
        const userRepository = new InMemoryUserRepository();
        const register = registerUser(userRepository);

        const result = await register(user)();

        // Expect the operation to succeed, meaning result is Right
        expect(isRight(result)).toBeTruthy();
      }),
      { numRuns: 100 },
    );
  });

  it("should not allow registering a user with an existing email", async () => {
    await fc.assert(
      fc.asyncProperty(UserArbitrary(), async (user) => {
        const userRepository = new InMemoryUserRepository();
        const register = registerUser(userRepository);

        // First registration should succeed
        await register(user)();

        // Attempt to register again with the same user details
        const result = await register(user)();

        // Expect the operation to fail this time, meaning result is Left
        expect(isLeft(result)).toBeTruthy();
      }),
      { numRuns: 100 },
    );
  });
});
