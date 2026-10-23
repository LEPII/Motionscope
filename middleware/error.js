import { logger } from "../utils/logger.js";

export default (err, req, res, next) => {
  if (err.name === "ValidationError") {
    logger.warn(err.message);
    return res.status(400).json({
      message: "Validation failed.",
      details: Object.values(err.errors).map((e) => e.message),
    });
  }

  if (err.name === "CastError") {
    logger.warn(err.message);
    return res.status(400).json({
      message: "Validation failed.",
      details: [`Invalid ${err.path}: ${JSON.stringify(err.value)}`],
    });
  }

  if (err.code === 11000) {
    logger.warn(err.message);
    const fields = Object.keys(err.keyValue || {});
    return res.status(409).json({
      message: "Already exists.",
      details: fields.map((field) => `'${field}' is already taken.`),
    });
  }

  const status = err.status || err.statusCode;
  if (status >= 400 && status < 500) {
    logger.warn(err.message);
    return res.status(status).json({ message: err.message });
  }

  logger.error(err.message);
  res.status(500).send(err.message);
};
