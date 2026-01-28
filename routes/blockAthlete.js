import {
  updateAthleteSet,
  postWarmUpAthleteSet,
  deleteWarmUpAthleteSet,
} from "../controllers/blockAthleteController.js";
import express from "express";
const router = express.Router();

// Update Exercise Sets
router.patch("/:blockId/:exerciseId/:setId", updateAthleteSet);

// Post a Warmup Set to a specific exercise
router.post("/:blockId/:exerciseId/sets", postWarmUpAthleteSet);

// Delete a Warmup Set to a specific exercise
router.delete("/:blockId/:exerciseId/:setId", deleteWarmUpAthleteSet);

export default router;
