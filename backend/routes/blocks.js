import blockValidation from "../middleware/blockMiddleware.js";
import {
  getSingleBlock,
  getAllBlocks,
  // postBlock,
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
router.get("/:athleteId/:blockId", getSingleBlock);

// Get all Blocks from a Specific Athlete
router.get("/:athleteId", getAllBlocks);

// Post a Block to a Specific Athlete
// router.post("/:athleteId", blockValidation, postBlock);

// Update a Block from a Specific Athlete
router.patch("/:athleteId/:blockId", blockValidation, updateBlock);

// Delete a Block from a Specific Athlete
router.delete("/:athleteId/:blockId", deleteBlock);

// Post/Save Templates for Blocks
router.post("/templateBlock", postTemplateBlock);

/// -- ATHLETE'S ENDPOINTS --

// Get Current Block (The Next or Current Workout)
router.get("/athletes/:blockId", getCurrentBlock);

// Get All Blocks
router.get("/athletes/blocks", getAllAthleteBlocks);

// Update Exercise Detail (Only 4 fields - Load, RPE/RPEMin and Notes)
router.patch("/athletes/:blockId", updateAthleteBlock);

export default router;
