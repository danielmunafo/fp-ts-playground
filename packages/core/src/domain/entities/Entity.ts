import { ValidationResult } from "../../common";

export interface Entity {
  validate(): ValidationResult<Entity>;
}
