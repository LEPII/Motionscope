const {
  CustomExercise,
  validateCustomExercises,
} = require("../model/customExercise");
const express = require("express");
const router = express.Router();

// GET a Single Custom Exercise
router.get("/:id", async (req, res) => {
  const singleCustomExercise = await CustomExercise.findById(req.params.id);
  res.send(singleCustomExercise);
});

// GET all Custom Exercises
router.get("/", async (req, res) => {
  const allCustomExercise = await CustomExercise.find();
  res.send(allCustomExercise);
});

// POST a Single Custom Exercise
router.post("/", async (req, res) => {
  try {
    const { error } = validateCustomExercises(req.body);
    if (error) return res.status(400).send(error.detail[0].message);

    let customExercise = new CustomExercise(req.body);

    const savedCustomExercise = await customExercise.save();

    res.status(201).json({
      message: "Custom exercise created successfully!",
      data: savedCustomExercise,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// UPDATE a Single Custom Exercise

// DELETE a Single Custom Exercise
