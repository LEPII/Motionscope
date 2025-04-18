import {
  getSingleCompDay,
  getAllCompDays,
  postCompDay,
  updateCompDay,
  deleteCompDay,
} from "../controllers/compDay.js";
import express from "express";
const router = express.Router();

// -- COACH'S ENDPOINTS --

// Get a Single CompDay from a Specific Athlete
router.get("/:athleteId/:compDayId", getSingleCompDay);

// Get all CompDays from a Specific Athlete
router.get("/", getAllCompDays);

// Post a CompDay to a Specific Athlete
router.post("/", postCompDay);

// Update a Block from a Specific Athlete
router.patch("/:athleteId/:compDayId", updateCompDay);

// Delete a Block from a Specific Athlete
router.delete("/:athleteId/:compDayId", deleteCompDay);

/// -- ATHLETE'S ENDPOINTS --

// // Get All CompDays
// router.get("/athletes/compDays", getAllAthleteCompDays);

// // Get Current CompDay
// router.get("/athletes/:compDayId", getCompDay);

// // Update CompDay Exercise Detail (Only 2 fields - actuallyAttempted & record)
// router.patch("/athletes/:compDayId", updateAthleteCompDay);

export default router;
