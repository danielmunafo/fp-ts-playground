import { constant, float, integer, stringMatching, uuidV } from "fast-check";

export const invalidTimestampArbitraries = [
  integer(),
  constant("invalid-date"),
  stringMatching(/.*abc$/),
  constant("2024-13-01T12:34:56Z"),
  constant("not-a-date"),
];

export const invalidUuidV4 = [
  integer(),
  stringMatching(/.*abc$/),
  uuidV(1),
  uuidV(2),
  uuidV(3),
  float(),
];
