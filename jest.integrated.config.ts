import jestConfig from "./jest.base.config";

const integratedJestConfig = {
  ...JSON.parse(JSON.stringify(jestConfig)),
  testMatch: ["**/?(*.)+(integrated.spec).ts"],
};

export default integratedJestConfig;
