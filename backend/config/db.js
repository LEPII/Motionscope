import winston from "winston";
import mongoose from "mongoose";

export default function dbInitializer() {
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => winston.info("connected to MongoDB for the dub"));
}
