import { logger } from "../utils/logger.js";
import mongoose from "mongoose";

export default function dbInitializer() {
  console.log("dbInitializer running...");
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
      logger.info("connected to MongoDB for the dub");

      if (!process.env.MOTIONSCOPE_JWT_PRIVATE_KEY) {
        logger.error(
          "FATAL ERROR: MOTIONSCOPE_JWT_PRIVATE_KEY is not defined in .env file."
        );
        process.exit(1);
      }
      logger.info("JWT Private Key configuration verified.");
    })
    .catch((err) => {
      logger.error("Could not connect to MongoDB...", err);
      process.exit(1);
    });
}
