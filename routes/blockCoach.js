import {
  postCoachExercise,
  updateWeeklySchedule,
  updateDailySchedule,
  updateSet,
  duplicateWeek,
  duplicateDailySchedule,
  duplicateExerciseEntry,
  deleteWeeklySchedule,
  deleteDailySchedule,
  deleteCoachExercise,
} from "../controllers/blockCoachController.js";
import express from "express";
const router = express.Router();

// Post a new exercise to the daily schedule
router.post(
  "/:blockId/weeks/:weekNumber/days/:dayIndex/exercises",
  postCoachExercise
);

// Update a specific week (e.g., change weekStartDate or replace all daily schedules).
router.patch("/:blockId/week/:weekNumber", updateWeeklySchedule);

// Update a single day’s exercises within a specific week.
router.patch("/:blockId/week/:weekNumber/day/:dayIndex", updateDailySchedule);

// Update individual sets (like reps, prescribedLoad, actualLoad, etc.)
router.patch(
  "/:blockId/week/:weekNumber/day/:dayIndex/exercise/:exerciseId/set/:setId",
  updateSet
);

// Duplicate a whole week in a block (coach only)
router.post("/:athleteId/:blockId/week/:weekNumber/duplicate", duplicateWeek);

// Duplicate a day's schedule into another day in the same week
router.post(
  "/:athleteId/:blockId/week/:weekNumber/day/:dayIndex/duplicate",
  duplicateDailySchedule
);

// Duplicate a single exercise within a day
router.post(
  "/:athleteId/:blockId/week/:weekNumber/day/:dayIndex/exercise/:exerciseId/duplicate",
  duplicateExerciseEntry
);

// Week delete
router.delete("/block/:blockId/week/:weekNumber", deleteWeeklySchedule);

// Day delete (clears the day by index)
router.delete("/block/:blockId/week/:weekNumber/day/:dayIndex", deleteDailySchedule);

// Deletes a Specific Exercise
router.delete(
  "/coach/:blockId/weeks/:weekNumber/days/:dayIndex/exercises/:exerciseId",
  deleteCoachExercise
);

export default router;
