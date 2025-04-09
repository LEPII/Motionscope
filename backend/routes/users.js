import auth from "../middleware/auth.js";
import express from "express";
const router = express.Router();
import {
  getCurrentUser,
  registerUser,
  addAthleteToRoster,
  deleteAthleteFromRoster,
  deleteSelfFromTheCoachRoster,
} from "../controllers/usersController.js";

// get current user
router.get("/me", auth, getCurrentUser);

// register user
router.post("/", registerUser);

// -- COACH'S ENDPOINTS --

// Add Athlete to Roster
router.post("/coaches/roster", addAthleteToRoster);

// Delete Athlete from Roster

router.delete("/coaches/roster", deleteAthleteFromRoster);

// -- ATHLETE'S ENDPOINTS --

router.delete("/athlete/roster", deleteSelfFromTheCoachRoster);


export default router;
