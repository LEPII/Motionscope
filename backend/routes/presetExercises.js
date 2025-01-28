import {
  getSinglePresetExercise,
  getAllPresetExercise,
  postPresetExercise,
  updatePresetExercise,
  deletePresetExercise,
} from "../controllers/presetExercisesController.js";
import express from "express";
const router = express.Router();

// GET a Single Preset Custom Exercise
router.get("/:id", getSinglePresetExercise);

// GET all Preset Exercises
router.get("/", getAllPresetExercise);

// POST a Single Preset Exercise - Dev Only
router.post("/", postPresetExercise);

// UPDATE a Single Preset Exercise - Dev Only
router.patch("/:id", updatePresetExercise);

// DELETE a Single Preset Exercise - Dev Only
router.delete("/:id", deletePresetExercise);

export default router;
