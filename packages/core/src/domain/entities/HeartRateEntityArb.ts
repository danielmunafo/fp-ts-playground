import { Arbitrary, constant, date, integer, record, uuidV } from "fast-check";
import * as t from "io-ts";
import { AttributesOnly } from "../../common";
import {
  HeartRateEntity,
  MAX_HEART_RATE,
  MIN_HEART_RATE,
  MinMaxNumberBrand,
} from "./HeartRateEntity";

const brandMinMaxHeartRateNumber = (
  n: number,
): t.Branded<number, MinMaxNumberBrand> =>
  n as t.Branded<number, MinMaxNumberBrand>;

const minMaxHeartRateValueArbitrary = integer({
  min: MIN_HEART_RATE,
  max: MAX_HEART_RATE,
}).map(brandMinMaxHeartRateNumber);

const lowRangeInvalidHeartRateValue = integer({
  min: Number.MIN_SAFE_INTEGER,
  max: MIN_HEART_RATE - 1,
});
const highRangeInvalidHeartRateValue = integer({
  min: MAX_HEART_RATE + 1,
  max: Number.MAX_SAFE_INTEGER,
});
export const invalidHeartRateValue = [
  lowRangeInvalidHeartRateValue,
  highRangeInvalidHeartRateValue,
];

export const HeartRateArbitrary = (
  overrides?: Partial<HeartRateEntity>,
): Arbitrary<AttributesOnly<HeartRateEntity>> => {
  return record({
    userId: overrides?.userId ? constant(overrides.userId) : uuidV(4),
    value: overrides?.value
      ? constant(overrides.value)
      : minMaxHeartRateValueArbitrary,
    timestamp: overrides?.timestamp ? constant(overrides.timestamp) : date(),
  });
};
