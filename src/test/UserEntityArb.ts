import { Arbitrary, string } from "fast-check";
import { User } from "../core";

export const UserArbitrary = (): Arbitrary<User> => {
  return string().chain((id) =>
    string().chain((name) =>
      string().map(
        (email): User => ({
          id,
          name,
          email,
        }),
      ),
    ),
  );
};
