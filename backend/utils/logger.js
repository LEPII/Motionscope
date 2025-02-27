import winston from "winston";

const logger = winston.createLogger({
  format: winston.format.combine(winston.format.simple()),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "exceptions.log" }),
  ],
  exceptionHandlers: [
    new winston.transports.File({ filename: "exceptions.log" }),
  ],
  exitOnError: true,
});

export { logger };
