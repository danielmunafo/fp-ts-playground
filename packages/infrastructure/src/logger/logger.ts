import {
  createLogger,
  format,
  transports,
  Logger as WinstonLogger,
} from "winston";

const defaultConfig = {
  level: "debug",
  format: format.combine(
    format.timestamp(),
    process.env.NODE_ENV === "production"
      ? format.json()
      : format.prettyPrint(),
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: "combined.log" }),
  ],
};
const logger = createLogger(defaultConfig);

export const debugLogger = createLogger(defaultConfig);
export type Logger = WinstonLogger;
export default logger;
