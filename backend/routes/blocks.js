import blockValidation from "../middleware/blockMiddleware.js";
import {
  getSingleBlock,
  getAllBlocks,
  postBlock,
  postCoachExercise,
  updateBlock,
  updateWeeklySchedule,
  updateDailySchedule,
  updateSet,
  deleteBlock,
  deleteCoachExercise,
  getCurrentBlock,
  getAllAthleteBlocks,
  updateAthleteSet,
  postWarmUpAthleteSet,
  deleteWarmUpAthleteSet,
} from "../controllers/blockController.js";
import express from "express";
const router = express.Router();

// -- COACH'S ENDPOINTS --

// Get a Single Block from a Specific Athlete
router.get("/:athleteId/:blockId", getSingleBlock);

// Get all Blocks from a Specific Athlete
router.get("/:athleteId", getAllBlocks);

// Post a Block to a Specific Athlete
router.post("/:athleteId", blockValidation, postBlock);

// Post a new exercise to the daily schedule
router.post(
  "/:blockId/weeks/:weekNumber/days/:dayIndex/exercises",
  postCoachExercise
);

// Update a Block from a Specific Athlete
router.patch("/:athleteId/:blockId", blockValidation, updateBlock);

// Update a specific week (e.g., change weekStartDate or replace all daily schedules).
router.patch("/:athleteId/:blockId/week/:weekNumber", updateWeeklySchedule);

// Update a single day’s exercises within a specific week.
router.patch(
  "/:athleteId/:blockId/week/:weekNumber/day/:dayIndex",
  updateDailySchedule
);

// Update individual sets (like reps, prescribedLoad, actualLoad, etc.)
router.patch(
  "/:athleteId/:blockId/week/:weekNumber/day/:dayIndex/set/:setIndex",
  updateSet
);

// Delete a Block from a Specific Athlete
router.delete("/:athleteId/:blockId", deleteBlock);

// Deletes a Specific Exercise
router.delete(
  "/coach/:blockId/weeks/:weekNumber/days/:dayIndex/exercises/:exerciseId",
  deleteCoachExercise
);

/// -- ATHLETE'S ENDPOINTS --

// Get Current Block (The Next or Current Workout)
router.get("/athletes/:blockId", getCurrentBlock);

// Get All Blocks
router.get("/athletes/blocks", getAllAthleteBlocks);

// Update Exercise Sets
router.patch("/:blockId/:exerciseId/:setId", updateAthleteSet);

// Post a Warmup Set to a specific exercise
router.post("/:blockId/:exerciseId/sets", postWarmUpAthleteSet);

// Delete a Warmup Set to a specific exercise
router.delete("/:blockId/:exerciseId/:setId", deleteWarmUpAthleteSet);

export default router;
