import { assert, property } from "fast-check";
import * as E from "fp-ts/Either";
import { UserArbitrary } from "../../../test";
import { validateUser } from "./UserEntity";

describe("User entity", () => {
  it("should conform to the User domain model", () => {
    assert(
      property(UserArbitrary(), (user) => {
        const validationResult = validateUser(user);
        expect(E.isRight(validationResult)).toBeTruthy();
      }),
      { numRuns: 100 },
    );
  });
});
