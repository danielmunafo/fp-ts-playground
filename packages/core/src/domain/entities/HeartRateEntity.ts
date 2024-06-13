import { Either } from "fp-ts/lib/Either";
import * as t from "io-ts";
import { date, withMessage } from "io-ts-types";
import { AttributesOnly, UUIDv4, ValidationResult } from "../../common";
import { Entity } from "./Entity";

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

export class HeartRateEntity implements Entity {
  public readonly userId: string;
  public readonly value: number;
  public readonly timestamp: Date;

  constructor({ userId, value, timestamp }: AttributesOnly<HeartRateEntity>) {
    this.userId = userId;
    this.value = value;
    this.timestamp = timestamp;
  }

  validate(): ValidationResult<HeartRateEntity> {
    return HeartRateCodec.decode(this) as Either<t.Errors, HeartRateEntity>;
  }
}
