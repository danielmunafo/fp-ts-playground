import { assert, property } from "fast-check";
import { isLeft, isRight } from "fp-ts/Either";
import { UserArbitrary } from "../../../test";
import { validateUser } from "./UserEntity";

describe("User entity", () => {
  it("should conform to the User domain model", () => {
    assert(
      property(UserArbitrary(), (user) => {
        const validationResult = validateUser(user);
        const success = isRight(validationResult);
        expect(success).toBeTruthy();
      }),
      { numRuns: 20 },
    );
  });

  const hasValidationError = (
    errors: Array<{ message?: string }>,
    field: string,
  ) => errors.some((error) => error.message?.toLowerCase().includes(field));

  test.each([
    { field: "email", value: "not-a-valid-email", errorField: "email" },
    { field: "id", value: "not-a-valid-id", errorField: "id" },
  ])(
    "should return error on bad $field validation",
    ({ field, value, errorField }) => {
      const overrides = { [field]: value };

      assert(
        property(UserArbitrary(overrides), (user) => {
          const validationResult = validateUser(user);
          const error = isLeft(validationResult);
          if (error) {
            expect(
              hasValidationError(validationResult.left, errorField),
            ).toBeTruthy();
          } else {
            expect(true).toBeFalsy();
          }
        }),
        { numRuns: 5 },
      );
    },
  );
});
