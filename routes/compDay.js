import {
  getSingleCompDayForAthlete,
  getAllCompDaysForAthlete,
  postCompDay,
  updateCoachCompDay,
  deleteCompDay,
  getAthleteCompDay,
  getAllAthleteCompDays,
  updateAthleteCompDay,
} from "../controllers/compDay.js";
import validate from "../middleware/validate.js";
import {
  compDaySchema,
  compDayUpdateSchema,
  attemptUpdateSchema,
} from "../validation/compDay.js";
import express from "express";
const router = express.Router();

// -- COACH'S ENDPOINTS --

// Get a Single CompDay from a Specific Athlete
router.get("/:athleteId/:compDayId", getSingleCompDayForAthlete);

// Get all CompDays from a Specific Athlete
router.get("/", getAllCompDaysForAthlete);

// Post a CompDay to a Specific Athlete
router.post("/", validate(compDaySchema), postCompDay);

// Update a CompDay from a Specific Athlete
router.patch(
  "/:compDayId",
  validate(compDayUpdateSchema, { noDefaults: true }),
  updateCoachCompDay
);

// Delete a CompDay from a Specific Athlete
router.delete("/:athleteId/:compDayId", deleteCompDay);

/// -- ATHLETE'S ENDPOINTS --

// Get Current CompDay
router.get("/athletes/:compDayId", getAthleteCompDay);

// Get All CompDays
router.get("/athletes", getAllAthleteCompDays);

// Update CompDay Exercise Detail (Only 1 field - actuallyAttempted)
router.patch(
  ":compDayId/lifts/:liftsName/:attemptNumber/:attemptIndex/athlete",
  validate(attemptUpdateSchema),
  updateAthleteCompDay
);

export default router;
