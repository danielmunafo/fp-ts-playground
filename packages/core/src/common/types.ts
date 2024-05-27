import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import * as t from "io-ts";
import { withMessage } from "io-ts-types";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const Email = withMessage(
  new t.Type<string, string, unknown>(
    "Email",
    (u): u is string => typeof u === "string",
    (u, c) =>
      pipe(
        t.string.validate(u, c),
        E.chain((s) => (emailRegex.test(s) ? t.success(s) : t.failure(u, c))),
      ),
    t.identity,
  ),
  () => "Invalid email",
);

const uuidV4Regex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const UUIDv4 = withMessage(
  new t.Type<string, string, unknown>(
    "UUIDv4",
    (u): u is string => typeof u === "string",
    (u, c) =>
      pipe(
        t.string.validate(u, c),
        E.chain((s) => (uuidV4Regex.test(s) ? t.success(s) : t.failure(u, c))),
      ),
    t.identity,
  ),
  () => "Invalid UUID v4",
);
