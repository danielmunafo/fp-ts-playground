import type { Config } from "jest";

export const packageOverrideConfigs = (packageName: string) => ({
  testMatch: [
    `<rootDir>/packages/${packageName}/**/__tests__/**/*.ts`,
    `<rootDir>/packages/${packageName}/**/?(*.)+(spec|test).ts`,
  ],
  projects: undefined,
  collectCoverage: undefined,
  coverageReporters: undefined,
});

const config: Config = {
  clearMocks: true,
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  moduleNameMapper: {
    "^@fp-ts-playground/(.*)$": "<rootDir>/packages/$1/src",
  },
  preset: "ts-jest",
  rootDir: "../../",
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.ts", "**/?(*.)+(spec|test).ts"],
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.json",
      },
    ],
  },
  projects: ["<rootDir>/packages/*/jest.config.ts"],
  collectCoverage: true,
  coverageDirectory: "<rootDir>/coverage",
  coverageReporters: ["json", "lcov", "text", "clover"],
};

export default config;
