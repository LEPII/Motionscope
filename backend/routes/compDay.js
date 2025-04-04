import express from "express";
const router = express.Router();

// -- COACH'S ENDPOINTS --

// Get a Single CompDay from a Specific Athlete
router.get("/:id", getSingleCompDay);

// Get all CompDays from a Specific Athlete
router.get("/", getAllCompDay);

// Post a CompDay to a Specific Athlete
router.post("/", postCompDay);

// Update a Block from a Specific Athlete
router.patch("/:compDayId", updateCompDay);

// Delete a Block from a Specific Athlete
router.delete("/:compDayId", deleteCompDay);

/// -- ATHLETE'S ENDPOINTS --

// Get All CompDays
router.get("/athletesCompDay", getAllAthleteCompDays);

// Get Current CompDay
router.get("/:athletesCompDayId", getCompDay);

// Update CompDay Exercise Detail (Only 2 fields - actuallyAttempted & record)
router.patch("/:athletesCompDayId", updateAthleteCompDay);

export default router;