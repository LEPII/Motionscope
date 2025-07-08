import {
  getRosterList,
  postProgram,
  getCurrentProgram,
  postProgram,
  getCurrentProgramForAthlete,
} from "../controllers/programController.js";
import express from "express";
const router = express.Router();

// -- COACH'S ENDPOINTS --

// Get List of All Athletes
router.get("/", getRosterList);

// Get a Single Program from a specific Athlete - (Which will then show a preview of all blocks)

router.get("/:athleteId", getCurrentProgram);

// Post a Program - Must have no more / no less than 1 athlete associated
router.post("/", postProgram);

// Update a Program

// Delete a Program / Athlete - Archive Option?
router.post("/:id", deleteProgram);

// -- ATHLETE'S ENDPOINTS --

// Get Current Program

router.get("/athlete", getCurrentProgramForAthlete);

export default router;
