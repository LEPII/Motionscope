import auth from "../middleware/auth.js";
import {
  getQuestionnaire,
  postQuestionnaire,
  updateQuestionnaire,
} from "../controllers/questionnairesController.js";
import express from "express";
const router = express.Router();

// -- COACH'S ENDPOINTS --

// Get a specific Athlete's Questionnaire
router.get("/:athletesId", getQuestionnaire);

/// -- ATHLETE'S ENDPOINTS --

// Post Questionnaire
router.post("/athlete", auth, postQuestionnaire);

// Patch Questionnaire
router.patch("/:id", auth, updateQuestionnaire);

export default router;
