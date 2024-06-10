import { Config } from "jest";
import { getConfig } from "../../jest.base.config";

const config: Config = {
  ...getConfig("application"),
};

export default config;
