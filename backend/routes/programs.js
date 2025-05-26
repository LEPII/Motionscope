import { postProgram } from "../controllers/programController.js";
import express from "express";
const router = express.Router();

// -- COACH'S ENDPOINTS --

// Get List of All Athletes

// Get a Single Program from a specific Athlete - (Which will then show a preview of all blocks)

// Post a Program - Must have no more / no less than 1 athlete associated
router.post("/", postProgram);

// Update a Program

// Delete a Program / Athlete - Archive Option?

// -- ATHLETE'S ENDPOINTS --

// Get Current Program

export default router;
