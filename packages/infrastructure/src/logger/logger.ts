import {
  createLogger,
  format,
  transports,
  Logger as WinstonLogger,
} from "winston";

const logger = createLogger({
  level: "info",
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
});

export type Logger = WinstonLogger;
export default logger;
