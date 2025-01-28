import {
  getSingleCustomExercise,
  getAllCustomExercise,
  postCustomExercise,
  updateCustomExercise,
  deleteCustomExercise,
} from "../controllers/customExercisesController.js";
import express from "express";
const router = express.Router();

// GET a Single Custom Exercise
router.get("/:id", getSingleCustomExercise);

// GET all Custom Exercises
router.get("/", getAllCustomExercise);

// POST a Single Custom Exercise
router.post("/", postCustomExercise);

// UPDATE a Single Custom Exercise
router.patch("/:id", updateCustomExercise);

// DELETE a Single Custom Exercise
router.delete("/:id", deleteCustomExercise);

export default router;
