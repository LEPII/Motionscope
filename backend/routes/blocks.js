const { Block, validateBlock } = require("../model/block");
const {
  CustomExercise,
  validateCustomExercises,
} = require("../model/customExercise");
const {
  PresetExercise,
  validatePresetExercises,
} = require("../model/presetExercise");
const express = require("express");
const _ = require("lodash");
const router = express.Router();
const blockValidation = require("../middleware/blockMiddleware");

// -- COACH'S ENDPOINTS --

// Get a Single Block from a Specific Athlete

router.get("/:id", async (req, res) => {
  const singleBlock = await Block.findById(req.params.id);
  res.send(singleBlock);
});

// Get all Blocks from a Specific Athlete

router.get("/", async (req, res) => {
  const allBlocks = await Block.find();
  res.send(allBlocks);
});

// Post a Block to a Specific Athlete

router.post("/", blockValidation, async (req, res) => {
  try {
    const {
      blockName,
      numberOfWeeks,
      blockStartDate,
      days,
      weeklySchedule,
      presetId = null,
    } = req.body;

    // Batch Fetching Preset Exercises
    let presetExerciseMap;
    if (presetId) {
      const allPresetExercises = await PresetExercise.find();
      presetExerciseMap = new Map(
        allPresetExercises.map((preset) => [preset._id.toString(), preset])
      );
    }

    function createFromPresetExercise(presetId, presetExerciseMap, exercise) {
      const presetExercise = presetExerciseMap.get(presetId.toString());
      if (!presetExercise) {
        throw new Error(`Preset exercise with ID ${presetId} not founds`);
      }
      return new CustomExercise({
        name: presetExercise.name,
        description: presetExercise.description,
        sets: exercise.sets,
        repsMin: exercise.repsMin || 0,
        reps: exercise.reps,
        prescribedLoadMin: exercise.prescribedLoadMin || 0,
        prescribedLoad: exercise.prescribedLoad,
        prescribedRPEMin: exercise.prescribedRPEMin || 0,
        prescribedRPE: exercise.prescribedRPE,
        cuesFromCoach: exercise.cuesFromCoach || "",
        sideNote: exercise.sideNote || "",
      });
    }

    function createCustomExercise(exercise) {
      return new CustomExercise({
        name: exercise.name,
        description: exercise.description,
        sets: exercise.sets,
        repsMin: exercise.repsMin || 0,
        reps: exercise.reps,
        prescribedLoadMin: exercise.prescribedLoadMin || 0,
        prescribedLoad: exercise.prescribedLoad,
        prescribedRPEMin: exercise.prescribedRPEMin || 0,
        prescribedRPE: exercise.prescribedRPE,
        cuesFromCoach: exercise.cuesFromCoach || "",
        sideNote: exercise.sideNote || "",
      });
    }

    const newExercise = dailySchedule.exercise.map((exercise) => {
      if (exercise.presetId) {
        return createFromPresetExercise(exercise.presetId, presetExerciseMap);
      } else {
        return createCustomExercise(exercise);
      }
    });

    const newBlock = new Block({
      blockName,
      numberOfWeeks,
      blockStartDate,
      days,
      weeklySchedule: weeklySchedule.map((week) => ({
        weekStartDate: week.weekStartDate,
        dailySchedule: week.dailySchedule.map((dailySchedule) => ({
          primaryExercise: dailySchedule.primaryExercise,
          exercises: newExercise,
        })),
      })),
    });

    const savedBlock = await newBlock.save();
    res
      .status(201)
      .json({ message: "Block Successfully Created", data: savedBlock });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
});

// Update a Block from a Specific Athlete

router.patch("/:id", blockValidation, async (req, res) => {
  const currentBlock = await Block.findByIdAndUpdate(
    req.params.id,
    _.pick(req.body, ["blockName", "numberOfWeeks", "blockStartDate", "days"], {
      new: true,
    })
  );

  const updateData = {
    blockName,
    numberOfWeeks,
    blockStartDate,
    days,
    weeklySchedule: weeklySchedule.map((week) => ({
      weekStartDate,
      dailySchedule: day.dailySchedule.map((day) => ({
        primExercises,
        presetExercise: day.exercise.map(async (presetExerciseData) => {}),
      })),
    })),
  };
});

// Delete a Block from a Specific Athlete

// Post/Save Templates for Blocks

router.post("/", async (req, res) => {
  let blockTemplate = new Block(req.body);
  blockTemplate = await blockTemplate.save();
  res.send(blockTemplate);
});

/// -- ATHLETE'S ENDPOINTS --

// Get Current Block (The Next or Current Workout)

router.get("/:id", async (req, res) => {
  const singleBlock = await Block.findById(req.params.id);
  res.send(singleBlock);
});

// Get All Blocks

router.get("/", async (req, res) => {
  const allBlocks = await Block.find();
  res.send(allBlocks);
});

// Update Blocks (Only three fields - Load, RPE and Notes

router.patch("/:id", async (req, res) => {
  try {
    const { blockId, exerciseId } = req.params;
    const { actualLoad, actualRPEMin, actualRPE, sideNote } = req.body;

    const block = await Block.findById(blockId);

    if (!block) {
      return res.status(400).json({ error: "Block not found" });
    }

    const currentExercise = block.weeklySchedule.find((week) => {
      return week.dailySchedule.some((day) => {
        return day.exercises.some((exercise) => {
          return exercise._id.toString() === exerciseId.toString();
        });
      });
    });

    if (!currentExercise) {
      return res.status(404).json({ error: "Exercise not found" });
    }

    currentExercise.actualLoad = actualLoad;
    currentExercise.actualRPEMin = actualRPEMin;
    currentExercise.actualRPE = actualRPE;

    await block.save();

    res
      .status(200)
      .json({ message: "Exercise updated successfully", currentExercise });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update exercise" });
  }
});
