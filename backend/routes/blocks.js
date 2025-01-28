import blockValidation from "../middleware/blockMiddleware.js";
import {
  getSingleBlock,
  getAllBlocks,
  postBlock,
  updateBlock,
  deleteBlock,
  postTemplateBlock,
  getCurrentBlock,
  getAllAthleteBlocks,
  updateAthleteBlock,
} from "../controllers/blockController.js";
import express from "express";
const router = express.Router();

// -- COACH'S ENDPOINTS --

// Get a Single Block from a Specific Athlete
router.get("/:id", getSingleBlock);

// Get all Blocks from a Specific Athlete
router.get("/", getAllBlocks);

// Post a Block to a Specific Athlete
router.post("/", blockValidation, postBlock);

// Update a Block from a Specific Athlete
router.patch("/:blockId", blockValidation, updateBlock);

// Delete a Block from a Specific Athlete
router.delete("/:blockId", deleteBlock);

// Post/Save Templates for Blocks
router.post("/templateBlock", postTemplateBlock);

/// -- ATHLETE'S ENDPOINTS --

// Get Current Block (The Next or Current Workout)
router.get("/:id", getCurrentBlock);

// Get All Blocks
router.get("/", getAllAthleteBlocks);

// Update Exercise Detail (Only 4 fields - Load, RPE/RPEMin and Notes)
router.patch("/:blockId/customExercises", updateAthleteBlock);

export default router;
