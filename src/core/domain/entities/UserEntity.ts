import * as E from "fp-ts/Either";
import * as t from "io-ts";

const UserCodec = t.type({
  id: t.string,
  name: t.string,
  email: t.string,
});

type ValidationResult<A> = E.Either<t.Errors, A>;
export type User = t.TypeOf<typeof UserCodec>;

export function validateUser(data: unknown): ValidationResult<User> {
  return UserCodec.decode(data);
}
