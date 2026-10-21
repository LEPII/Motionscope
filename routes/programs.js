import {
  getCurrentProgram,
  postProgram,
  deleteProgram,
  toggleProgramArchive,
  getCurrentProgramForAthlete,
} from "../controllers/programController.js";
import validate from "../middleware/validate.js";
import { programSchema } from "../validation/program.js";
import express from "express";
const router = express.Router();

// -- COACH'S ENDPOINTS --

// Get a Single Program from a specific Athlete
router.get("/:athleteId", getCurrentProgram);

// Post a Program - Must have no more / no less than 1 athlete associated
router.post("/", validate(programSchema), postProgram);

// Delete a Program / Athlete
router.post("/:id", deleteProgram);

// Archive a Program
router.patch("/archive/:id", toggleProgramArchive);

// -- ATHLETE'S ENDPOINTS --

// Get Current Program
router.get("/athlete", getCurrentProgramForAthlete);

export default router;
