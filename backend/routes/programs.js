import {
  getRosterList,
  getCurrentProgram,
  postProgram,
  deleteProgram,
  toggleProgramArchive,
  getCurrentProgramForAthlete,
} from "../controllers/programController.js";
import express from "express";
const router = express.Router();

// -- COACH'S ENDPOINTS --

// Get List of All Athletes
router.get("/", getRosterList);

// Get a Single Program from a specific Athlete 
router.get("/:athleteId", getCurrentProgram);

// Post a Program - Must have no more / no less than 1 athlete associated
router.post("/", postProgram);

// Delete a Program / Athlete
router.post("/:id", deleteProgram);

// Archive a Program
router.patch("/archive/:id", toggleProgramArchive);

// -- ATHLETE'S ENDPOINTS --

// Get Current Program
router.get("/athlete", getCurrentProgramForAthlete);

export default router;
