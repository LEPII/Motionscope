const { Block, validateBlock } = require("../model/block");
const {
  customExercise,
  validateCustomExercises,
  Exercise,
} = require("../model/customExercise");
const {
  presetExercise,
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
  const { blockName, numberOfWeeks, blockStartDate, days, weeklySchedule } =
    req.body;

  const newBlock = new Block({
    blockName,
    numberOfWeeks,
    blockStartDate,
    days,
    weeklySchedule: weeklySchedule.map((week) => ({
      weekStartDate: week.weekStartDate,
      dailySchedule: week.dailySchedule.map((dailySchedule) => ({
        primaryExercise: dailySchedule.primaryExercise,
        exercises: dailySchedule.exercises.map((exercise) => {
          const newExercise = new Exercise({
            name: exercise.name,
            description: exercise.description,
            sets: exercise.sets,
            repsMin: exercise.repsMin || 0,
            repsMax: exercise.repsMax,
            prescribedLoadMin: exercise.prescribedLoadMin || 0,
            prescribedRPEMin: exercise.prescribedRPEMin || 0,
            prescribedLoadMax: exercise.prescribedLoadMax,
            prescribedRPEMax: exercise.prescribedRPEMax,
            actualLoadMin: exercise.actualLoadMin || 0,
            actualLoadMax: exercise.actualLoadMax,
            actualRPEMin: exercise.actualRPEMin || 0,
            actualRPEMax: exercise.actualRPEMax,
            cuesFromCoach: exercise.cuesFromCoach || "",
            sideNote: exercise.sideNote || "",
          });
          return newExercise;
        }),
      })),
    })),
  });


  

  const savedBlock = await newBlock.save();
  res.send(savedBlock);
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
