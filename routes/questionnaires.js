import auth from "../middleware/auth.js";
import {
  getQuestionnaire,
  postQuestionnaire,
  updateQuestionnaire,
} from "../controllers/questionnairesController.js";
import validate from "../middleware/validate.js";
import {
  questionnaireSchema,
  questionnaireUpdateSchema,
} from "../validation/questionnaire.js";
import express from "express";
const router = express.Router();

// -- COACH'S ENDPOINTS --

// Get a specific Athlete's Questionnaire
router.get("/:athletesId", getQuestionnaire);

/// -- ATHLETE'S ENDPOINTS --

// Post Questionnaire
router.post(
  "/athlete",
  auth,
  validate(questionnaireSchema),
  postQuestionnaire
);

// Patch Questionnaire
router.patch(
  "/:id",
  auth,
  validate(questionnaireUpdateSchema, { noDefaults: true }),
  updateQuestionnaire
);

export default router;
