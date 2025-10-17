import {
  postCoachExercise,
  updateWeeklySchedule,
  updateDailySchedule,
  updateSet,
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
// Deletes a Specific Exercise
router.delete(
  "/coach/:blockId/weeks/:weekNumber/days/:dayIndex/exercises/:exerciseId",
  deleteCoachExercise
);

export default router;
