import * as fs from "fs";
import type { Config } from "jest";

const swcConfig = JSON.parse(fs.readFileSync(`${__dirname}/.swcrc`, "utf-8"));

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
  rootDir: "../../",
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.ts", "**/?(*.)+(spec|test).ts"],
  transform: {
    "^.+\\.(t|j)sx?$": [
      "@swc/jest",
      {
        ...swcConfig,
      },
    ],
  },
  testTimeout: 200,
  projects: ["<rootDir>/packages/*/jest.config.ts"],
  collectCoverage: true,
  coverageDirectory: "<rootDir>/coverage",
  coverageReporters: ["json", "lcov", "text", "clover"],
};

export default config;
