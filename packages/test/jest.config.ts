import { Config } from "jest";
import { getConfig } from "../../jest.base.config";

const config: Config = {
  ...getConfig("test"),
};

export default config;
