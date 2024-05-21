import { assert, asyncProperty } from "fast-check";
import { fold as foldEither, isRight } from "fp-ts/Either";
import { fold as foldOption } from "fp-ts/Option";
import { pipe } from "fp-ts/function";
import { UserArbitrary } from "../../test";
import { InMemoryUserRepository } from "./InMemoryUserRepository";

describe("InMemoryUserRepository", () => {
  it("should save and find", async () => {
    await assert(
      asyncProperty(UserArbitrary(), async (inputUser) => {
        // Given a valid user
        const repository = new InMemoryUserRepository();

        // When saving it
        const saveUserTask = repository.save(inputUser);
        const firstSaveResult = await saveUserTask();
        const success = isRight(firstSaveResult);
        expect(success).toBeTruthy();

        // Then the system should be able to find it
        const findByEmailTask = repository.findByEmail(inputUser.email);
        const user = await findByEmailTask();

        pipe(
          user,
          foldEither(
            (_error) => {
              expect(false).toBeTruthy();
            },
            (option) => {
              pipe(
                option,
                foldOption(
                  () => {
                    expect(false).toBeTruthy();
                  },
                  (user) => {
                    expect(user).toEqual(inputUser);
                  },
                ),
              );
            },
          ),
        );
      }),
      { numRuns: 20 },
    );
  });
});
