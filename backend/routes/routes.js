import express from "express";
import auth from "./auth.js";
import blocks from "./blocks.js";
import customExercises from "./customExercises.js";
import presetExercises from "./presetExercises.js";
import programs from "./programs.js";
import questionnaires from "./questionnaires.js";
import users from "./users.js";
import error from "../middleware/error.js";

export default function myRoutes(app) {
  app.use(express.json());
  app.use("/api/auth", auth);
  app.use("/api/blocks", blocks);
  app.use("/api/customExercises", customExercises);
  app.use("/api/presetExercises", presetExercises);
  app.use("/api/programs", programs);
  app.use("/api/questionnaires", questionnaires);
  app.use("/api/users", users);
  app.use(error);
}
