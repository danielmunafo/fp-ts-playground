import {
  Arbitrary,
  constant,
  emailAddress,
  record,
  string,
  uuidV,
} from "fast-check";
import { User } from "../core";

export const UserArbitrary = (overrides?: Partial<User>): Arbitrary<User> => {
  return record({
    id: overrides?.id ? constant(overrides.id) : uuidV(4),
    name: overrides?.name ? constant(overrides.name) : string(),
    email: overrides?.email ? constant(overrides.email) : emailAddress(),
  });
};
