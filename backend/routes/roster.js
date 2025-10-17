import auth from "../middleware/auth.js";
import express from "express";
const router = express.Router();
import {
  getRosterList,
  addAthleteToRoster,
  deleteAthleteFromRoster,
  deleteSelfFromTheCoachRoster,
} from "../controllers/rosterController.js";

// -- COACH'S ENDPOINTS --

// Get List of All Athletes
router.get("/", getRosterList);

// Add Athlete to Roster
router.post("/coaches/roster", addAthleteToRoster);

// Delete Athlete from Roster

router.delete("/coaches/roster", deleteAthleteFromRoster);

// -- ATHLETE'S ENDPOINTS --

// Delete Self from Roster

router.delete("/athlete/roster", deleteSelfFromTheCoachRoster);

export default router;
