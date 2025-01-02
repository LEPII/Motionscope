const {
  PresetExercise,
  validatePresetExercises,
} = require("../model/presetExercise");
const express = require("express");
const router = express.Router();

// GET a Single Preset Custom Exercise
router.get("/:id", async (req, res) => {
  const singlePresetExercise = await PresetExercise.findById(req.params.id);
  res.send(singlePresetExercise);
});

// GET all Preset Exercises
router.get("/", async (req, res) => {
  const allPresetExercise = await PresetExercise.find();
  res.send(allPresetExercise);
});

// POST a Single Preset Exercise - Dev Only
router.post("/", auth, async (req, res) => {
  try {
    const { error } = validatePresetExercises(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let presetExercise = new PresetExercise(req.body);

    const savedPresetExercise = await presetExercise.save();

    res.status(201).json({
      message: "Preset exercise created successfully!",
      data: savedPresetExercise,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// UPDATE a Single Preset Exercise - Dev Only

// DELETE a Single Preset Exercise - Dev Only
