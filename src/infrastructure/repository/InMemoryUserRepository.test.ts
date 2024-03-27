// src/infrastructure/InMemoryUserRepository.test.ts

import * as fc from "fast-check";
import { isLeft, isRight } from "fp-ts/Either";
import { UserArbitrary } from "../../test";
import { InMemoryUserRepository } from "./InMemoryUserRepository";

describe("InMemoryUserRepository", () => {
  it("should save unique users and reject duplicates", async () => {
    await fc.assert(
      fc.asyncProperty(UserArbitrary(), async (user) => {
        const repository = new InMemoryUserRepository();

        // First save should succeed
        const firstSaveResult = await repository.save(user)();
        expect(isRight(firstSaveResult)).toBeTruthy();

        // Attempt to save the same user again, expecting failure
        const secondSaveResult = await repository.save(user)();
        expect(isLeft(secondSaveResult)).toBeTruthy();
        if (isLeft(secondSaveResult)) {
          expect(secondSaveResult.left.message).toContain(
            InMemoryUserRepository.USER_ALREADY_EXISTS_MESSAGE,
          );
        }
      }),
      { numRuns: 100 },
    );
  });
});
