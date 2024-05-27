import * as E from "fp-ts/Either";
import * as t from "io-ts";
import { date, withMessage } from "io-ts-types";
import { UUIDv4 } from "../../common";

export interface MinMaxNumberBrand {
  readonly MinMaxNumber: unique symbol;
}

export const MIN_HEART_RATE = 0;
export const MAX_HEART_RATE = 500;

export const MinMaxNumber = withMessage(
  t.brand(
    t.number,
    (n): n is t.Branded<number, MinMaxNumberBrand> =>
      n >= MIN_HEART_RATE && n <= MAX_HEART_RATE,
    "MinMaxNumber",
  ),
  () => "Invalid value",
);

export const Timestamp = withMessage(date, () => "Invalid timestamp");

const HeartRateCodec = t.type({
  userId: UUIDv4,
  value: MinMaxNumber,
  timestamp: Timestamp,
});

type ValidationResult<A> = E.Either<t.Errors, A>;
export type HeartRate = t.TypeOf<typeof HeartRateCodec>;

export const validateHeartRate = (data: unknown): ValidationResult<HeartRate> =>
  HeartRateCodec.decode(data);
