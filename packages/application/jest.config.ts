import { Config } from "jest";
import baseConfig, { packageOverrideConfigs } from "../../jest.base.config";

const config: Config = {
  ...baseConfig,
  ...packageOverrideConfigs("application"),
};

export default config;
