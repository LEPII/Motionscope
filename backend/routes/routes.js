import express from "express";
import auth from "./auth.js";
import blockAthlete from "./blockAthlete.js";
import blockCoach from "./blockCoach.js";
import blocks from "./blocks.js";
import compDay from "./compDay.js";
import exercises from "./exercises.js";
import programs from "./programs.js";
import questionnaires from "./questionnaires.js";
import roster from "./roster.js";
import error from "../middleware/error.js";

export default function myRoutes(app) {
  app.use(express.json());
  app.use("/api/auth", auth);
  app.use("/api/blockAthlete", blockAthlete);
  app.use("/api/blockCoach", blockCoach);
  app.use("/api/blocks", blocks);
  app.use("/api/compDay", compDay);
  app.use("/api/exercises", exercises);
  app.use("/api/programs", programs);
  app.use("/api/questionnaires", questionnaires);
  app.use("/api/roster", roster);
  app.use(error);
}
