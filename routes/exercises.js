import {
  getSingleExercise,
  getExercises,
  postExercise,
  updateExercise,
  deleteExercise,
} from "../controllers/exercisesController.js";
import validate from "../middleware/validate.js";
import { exerciseSchema, exerciseUpdateSchema } from "../validation/exercise.js";
import express from "express";
const router = express.Router();

// -- COACH'S ENDPOINTS --

// GET a Single Custom Exercise
router.get("/:id", getSingleExercise);

// GET all Custom Exercises
router.get("/", getExercises);

// POST a Single Custom Exercise. Devs can only post Preset. Coaches can only post custom. 
router.post("/", validate(exerciseSchema), postExercise);

// UPDATE a Single Custom Exercise
router.patch("/:id", validate(exerciseUpdateSchema, { noDefaults: true }), updateExercise);

// DELETE a Single Custom Exercise
router.delete("/:id", deleteExercise);

export default router;
 