import * as E from "fp-ts/Either";
import * as t from "io-ts";
import { Email, UUIDv4 } from "../../common";

const UserCodec = t.type({
  id: UUIDv4,
  name: t.string,
  email: Email,
});

type ValidationResult<A> = E.Either<t.Errors, A>;
export type User = t.TypeOf<typeof UserCodec>;

export const validateUser = (data: unknown): ValidationResult<User> =>
  UserCodec.decode(data);
