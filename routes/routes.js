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
import authMiddleware from "../middleware/auth.js";
import error from "../middleware/error.js";

export default function myRoutes(app) {
  app.use(express.json());

  app.use("/api/auth", auth);

  app.use("/api/blockAthlete", authMiddleware, blockAthlete);
  app.use("/api/blockCoach", authMiddleware, blockCoach);
  app.use("/api/blocks", authMiddleware, blocks);
  app.use("/api/compDay", authMiddleware, compDay);
  app.use("/api/exercises", authMiddleware, exercises);
  app.use("/api/programs", authMiddleware, programs);
  app.use("/api/questionnaires", authMiddleware, questionnaires);
  app.use("/api/roster", authMiddleware, roster);

  app.use(error);
}
