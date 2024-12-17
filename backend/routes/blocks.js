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

router.post("/", async (req, res) => {
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

    function createPresetExercise(presetId, presetExerciseMap, exercise) {
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
        return createPresetExercise(exercise.presetId, presetExerciseMap);
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

// router.patch("/:id", async (req, res) => {

//   const currentBlock = await Block.findByIdAndUpdate(
//     req.params.id, _.pick(req.body, ["blockName", "numberOfWeeks", "blockStartDate", "days"], { new: true})
//   )

//   const updateData = {
//     blockName,
//     numberOfWeeks,
//     blockStartDate,
//     days,
//     weeklySchedule: weeklySchedule.map(week => ({
//       weekStartDate,
//       dailySchedule: day.dailySchedule.map(day => ({
//         primExercises,
//         presetExercise: day.exercise.map(async presetExerciseData => {
//         }),
//       }))
//     }))
//   };

//   if (numberOfWeeks !== weeklySchedule.length) {
//   return res.status(400).json({ error: 'Number of weeks being able to train must match the length of the weekly schedule.' });
// }

// for (const week of weeklySchedule) {
//   if (days.length !== week.dailySchedule.length) {
//     return res.status(400).json({ error: 'Number of days in weeklySchedule must match the specified days' });
//   }
// }

// Delete a Block from a Specific Athlete

// Post/Save Templates for Blocks

router.post("/", async (req, res) => {
  let blockTemplate = new Block(req.body);
  blockTemplate = await block.save();
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
