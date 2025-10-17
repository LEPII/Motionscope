import { Block, exerciseEntryCoachSchema } from "../model/block.js";
import mongoose from "mongoose";

const postCoachExercise = async (req, res) => {
  const { blockId, weekNumber, dayIndex } = req.params;
  const coachId = req.user._id;

  if (
    !mongoose.Types.ObjectId.isValid(blockId) ||
    isNaN(weekNumber) ||
    isNaN(dayIndex)
  ) {
    return res.status(400).json({ message: "Invalid parameters." });
  }

  const { error, value } = exerciseEntryCoachSchema.validate(req.body, {
    abortEarly: false,
    allowUnknown: false,
  });

  if (error) {
    return res.status(400).json({
      message: "Validation failed.",
      details: error.details.map((d) => d.message),
    });
  }

  const block = await Block.findOne({ _id: blockId, coach: coachId });
  if (!block) {
    return res
      .status(404)
      .json({ message: "Block not found or access denied." });
  }

  const weekIndex = parseInt(weekNumber) - 1;
  const dayIdx = parseInt(dayIndex);

  if (
    !block.blockSchedule?.[weekIndex] ||
    !block.blockSchedule[weekIndex].dailySchedule?.[dayIdx]
  ) {
    return res
      .status(404)
      .json({ message: "Invalid week or day index in block schedule." });
  }

  block.blockSchedule[weekIndex].dailySchedule[dayIdx].exercises.push(value);

  const updatedBlock = await block.save();

  logger.info(
    `Coach ${coachId} added new exercise to block ${blockId} (Week ${weekNumber}, Day ${dayIndex})`
  );

  res.status(201).json({
    message: "Exercise added successfully.",
    block: updatedBlock,
  });
};

const updateWeeklySchedule = async (req, res) => {
  const { athleteId, blockId, weekNumber } = req.params;
  const { value } = weeklyScheduleCoachSchema.validate(req.body);

  const block = await Block.findOne({ _id: blockId, coach: req.user._id });
  if (!block) return res.status(404).json({ message: "Block not found." });

  const weekIndex = block.blockSchedule.findIndex(
    (w) => w.weekNumber === parseInt(weekNumber)
  );
  if (weekIndex === -1)
    return res.status(404).json({ message: "Week not found." });

  block.blockSchedule[weekIndex] = {
    ...block.blockSchedule[weekIndex],
    ...value,
  };
  const updatedBlock = await block.save();
  return res.json(updatedBlock);
};

const updateDailySchedule = async (req, res) => {
  const { athleteId, blockId, weekNumber, dayIndex } = req.params;
  const { value } = dailyScheduleCoachSchema.validate(req.body);

  const block = await Block.findOne({ _id: blockId, coach: req.user._id });
  if (!block) return res.status(404).json({ message: "Block not found." });

  const week = block.blockSchedule.find(
    (w) => w.weekNumber === parseInt(weekNumber)
  );
  if (!week) return res.status(404).json({ message: "Week not found." });

  week.dailySchedule[dayIndex] = { ...week.dailySchedule[dayIndex], ...value };
  const updatedBlock = await block.save();
  return res.json(updatedBlock);
};

const updateSet = async (req, res) => {
  const { blockId, weekNumber, dayIndex, setIndex } = req.params;
  const { value } = setCoachSchema.validate(req.body);

  const block = await Block.findOne({ _id: blockId, coach: req.user._id });
  if (!block) return res.status(404).json({ message: "Block not found." });

  const week = block.blockSchedule.find(
    (w) => w.weekNumber === parseInt(weekNumber)
  );
  if (!week) return res.status(404).json({ message: "Week not found." });

  const day = week.dailySchedule[dayIndex];
  if (!day) return res.status(404).json({ message: "Day not found." });

  day.exercises[value.exerciseId].setsDetail[setIndex] = {
    ...day.exercises[value.exerciseId].setsDetail[setIndex],
    ...value,
  };

  const updatedBlock = await block.save();
  return res.json(updatedBlock);
};

const deleteCoachExercise = async (req, res) => {
  const { blockId, weekNumber, dayIndex, exerciseId } = req.params;
  const coachId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(blockId)) {
    return res.status(400).json({ message: "Invalid block ID." });
  }
  const block = await Block.findOne({ _id: blockId, coach: coachId });
  if (!block) {
    return res
      .status(404)
      .json({ message: "Block not found or access denied." });
  }

  const week = block.blockSchedule.find(
    (w) => w.weekNumber === parseInt(weekNumber)
  );
  if (!week) return res.status(404).json({ message: "Week not found." });

  const day = week.dailySchedule[dayIndex];
  if (!day) return res.status(404).json({ message: "Day not found." });

  const exerciseIndex = day.exercises.findIndex(
    (ex) => ex._id.toString() === exerciseId
  );
  if (exerciseIndex === -1) {
    return res.status(404).json({ message: "Exercise not found." });
  }

  day.exercises.splice(exerciseIndex, 1);

  const updatedBlock = await block.save();

  res.status(200).json({
    message: "Exercise deleted successfully.",
    block: updatedBlock,
  });
};

export {
  postCoachExercise,
  updateWeeklySchedule,
  updateDailySchedule,
  updateSet,
  deleteCoachExercise,
};
