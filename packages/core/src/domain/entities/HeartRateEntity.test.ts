import { assert, oneof, property, sample } from "fast-check";
import { isLeft, isRight } from "fp-ts/Either";
import { invalidTimestampArbitraries, invalidUuidV4 } from "../../common";
import { HeartRateEntity } from "./HeartRateEntity";
import {
  HeartRateArbitrary,
  invalidHeartRateValue,
} from "./HeartRateEntityArb";

describe("HeartRate entity", () => {
  it("should conform to the HeartRate domain model", () => {
    assert(
      property(HeartRateArbitrary(), (heartRate) => {
        const validationResult = new HeartRateEntity(heartRate).validate();
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
    {
      field: "timestamp",
      valueGeneration: oneof(...invalidTimestampArbitraries),
      errorField: "timestamp",
    },
    {
      field: "userId",
      valueGeneration: oneof(...invalidUuidV4),
      errorField: "uuid",
    },
    {
      field: "value",
      valueGeneration: oneof(...invalidHeartRateValue),
      errorField: "value",
    },
  ])(
    "should return error on bad [$field] validation",
    ({ field, valueGeneration, errorField }) => {
      assert(
        property(valueGeneration, (invalidInput) => {
          const heartRateArbitrary = HeartRateArbitrary({
            [field]: invalidInput,
          });
          const heartRate = sample(heartRateArbitrary, 1)[0];
          const validationResult = new HeartRateEntity(heartRate).validate();
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
