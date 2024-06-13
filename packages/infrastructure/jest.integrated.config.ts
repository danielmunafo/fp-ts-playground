import { Config } from "jest";
import { getConfig } from "../../jest.base.config";

const config: Config = {
  ...getConfig("infrastructure"),
  testMatch: ["<rootDir>/packages/infrastructure/**/*.+(integrated.spec).ts"],
  testTimeout: 5000,
};

export default config;
