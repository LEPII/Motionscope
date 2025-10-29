import {
  getSingleExercise,
  getAllExercises,
  postExercise,
  updateExercise,
  deleteExercise,
} from "../controllers/exercisesController.js";
import express from "express";
const router = express.Router();

// -- COACH'S ENDPOINTS --

// GET a Single Custom Exercise
router.get("/:id", getSingleExercise);

// GET all Custom Exercises
router.get("/", getAllExercises);

// POST a Single Custom Exercise. Devs can only post Preset. Coaches can only post custom. 
router.post("/", postExercise);

// UPDATE a Single Custom Exercise
router.patch("/:id", updateExercise);

// DELETE a Single Custom Exercise
router.delete("/:id", deleteExercise);

export default router;
 