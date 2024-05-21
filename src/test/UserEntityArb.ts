import { Arbitrary, emailAddress, string, uuidV } from "fast-check";
import { User } from "../core";

export const UserArbitrary = (): Arbitrary<User> => {
  return uuidV(4).chain((id) =>
    string().chain((name) =>
      emailAddress().map(
        (email): User => ({
          id,
          name,
          email,
        }),
      ),
    ),
  );
};
