import { Config } from "jest";
import baseConfig, { packageOverrideConfigs } from "../../jest.base.config";

const config: Config = {
  ...baseConfig,
  ...packageOverrideConfigs("infrastructure"),
};

export default config;
