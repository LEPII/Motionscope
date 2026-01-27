import {
  Block,
  exerciseEntryCoachSchema,
  weeklyScheduleCoachSchema,
  dailyScheduleCoachSchema,
  setCoachSchema,
} from "../model/block.js";
import { AthleteStats } from "../model/stats.js";
import { populateBlockTargetLoads } from "../utils/trainingLoad.js";
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
  const { blockId, weekNumber } = req.params;
  const { value } = weeklyScheduleCoachSchema.validate(req.body);

  const block = await Block.findOne({ _id: blockId, coach: req.user._id });
  if (!block) return res.status(404).json({ message: "Block not found." });

  const weekIndex = block.blockSchedule.findIndex(
    (w) => w.weekNumber === parseInt(weekNumber)
  );
  if (weekIndex === -1)
    return res.status(404).json({ message: "Week not found." });

  const requiresRecalc =
    value.dailySchedule &&
    value.dailySchedule.some((day) =>
      day.exercises?.some((ex) =>
        ex.setsDetail?.some(
          (set) =>
            set.prescribedLoad != null ||
            set.prescribedLoadMin != null ||
            set.prescribedRPE != null ||
            set.prescribedRPEMin != null
        )
      )
    );

  block.blockSchedule[weekIndex] = {
    ...block.blockSchedule[weekIndex],
    ...value,
  };

  if (requiresRecalc) {
    const athleteStats = await AthleteStats.findOne({ user: block.athlete });
    await populateBlockTargetLoads(block, athleteStats);
  }

  const updatedBlock = await block.save();
  return res.json(updatedBlock);
};

const updateDailySchedule = async (req, res) => {
  const { blockId, weekNumber, dayIndex } = req.params;
  const { value } = dailyScheduleCoachSchema.validate(req.body);

  const block = await Block.findOne({ _id: blockId, coach: req.user._id });
  if (!block) return res.status(404).json({ message: "Block not found." });

  const week = block.blockSchedule.find(
    (w) => w.weekNumber === parseInt(weekNumber)
  );
  if (!week) return res.status(404).json({ message: "Week not found." });

  const day = week.dailySchedule[dayIndex];
  if (!day) return res.status(404).json({ message: "Day not found." });

  const requiresRecalc =
    value.exercises &&
    value.exercises.some((ex) =>
      ex.setsDetail?.some(
        (set) =>
          set.prescribedLoad != null ||
          set.prescribedLoadMin != null ||
          set.prescribedRPE != null ||
          set.prescribedRPEMin != null
      )
    );

  week.dailySchedule[dayIndex] = { ...day, ...value };

  if (requiresRecalc) {
    const athleteStats = await AthleteStats.findOne({ user: block.athlete });
    await populateBlockTargetLoads(block, athleteStats);
  }

  const updatedBlock = await block.save();
  return res.json(updatedBlock);
};

const updateSet = async (req, res) => {
  const { blockId, weekNumber, dayIndex, exerciseId, setId } = req.params;
  const { value } = setCoachSchema.validate(req.body);

  const block = await Block.findOne({ _id: blockId, coach: req.user._id });
  if (!block) return res.status(404).json({ message: "Block not found." });

  const week = block.blockSchedule.find(
    (w) => w.weekNumber === parseInt(weekNumber)
  );
  if (!week) return res.status(404).json({ message: "Week not found." });

  const day = week.dailySchedule[dayIndex];
  if (!day) return res.status(404).json({ message: "Day not found." });

  const exercise = day.exercises.find(
    (ex) => ex.exerciseId.toString() === exerciseId
  );
  if (!exercise)
    return res.status(404).json({ message: "Exercise not found." });

  const set = exercise.setsDetail.id(setId);
  if (!set) return res.status(404).json({ message: "Set not found." });

  Object.assign(set, value);

  const athleteStats = await AthleteStats.findOne({ user: block.athlete });
  await populateBlockTargetLoads(block, athleteStats);

  const updatedBlock = await block.save();
  return res.json(updatedBlock);
};

const duplicateWeek = async (req, res) => {
  const { athleteId, blockId, weekNumber } = req.params;
  const coachId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(blockId)) {
    return res.status(400).json({ message: "Invalid block ID." });
  }

  const block = await Block.findOne({ _id: blockId, coach: coachId, athlete: athleteId });
  if (!block) {
    return res
      .status(404)
      .json({ message: "Block not found or access denied." });
  }

  const weekIndex = block.blockSchedule.findIndex(
    (w) => w.weekNumber === parseInt(weekNumber, 10)
  );
  if (weekIndex === -1) {
    return res.status(404).json({ message: "Week not found." });
  }

  const originalWeek = block.blockSchedule[weekIndex];
  const newWeekNumber = block.blockSchedule.length + 1;

  const clonedWeek = cloneWeek(originalWeek);
  clonedWeek.weekNumber = newWeekNumber;

  if (block.blockStartDate) {
    const start = new Date(block.blockStartDate);
    start.setDate(start.getDate() + (newWeekNumber - 1) * 7);
    clonedWeek.weekStartDate = start;
  }

  block.blockSchedule.push(clonedWeek);
  block.numberOfWeeks = block.blockSchedule.length;

  const updatedBlock = await block.save();

  return res.status(201).json({
    message: "Week duplicated successfully.",
    block: updatedBlock,
  });
};

const duplicateDailySchedule = async (req, res) => {
  const { athleteId, blockId, weekNumber, dayIndex } = req.params;
  const coachId = req.user._id;
  const { targetDayIndex } = req.body;

  if (!mongoose.Types.ObjectId.isValid(blockId)) {
    return res.status(400).json({ message: "Invalid block ID." });
  }

  const sourceDayIdx = parseInt(dayIndex, 10);
  const targetIdx = parseInt(targetDayIndex, 10);

  if (Number.isNaN(sourceDayIdx) || Number.isNaN(targetIdx)) {
    return res.status(400).json({ message: "Invalid day index." });
  }

  const block = await Block.findOne({ _id: blockId, coach: coachId, athlete: athleteId });
  if (!block) {
    return res
      .status(404)
      .json({ message: "Block not found or access denied." });
  }

  const week = block.blockSchedule.find(
    (w) => w.weekNumber === parseInt(weekNumber, 10)
  );
  if (!week) {
    return res.status(404).json({ message: "Week not found." });
  }

  if (!week.dailySchedule[sourceDayIdx]) {
    return res.status(404).json({ message: "Source day not found." });
  }

  if (targetIdx < 0 || targetIdx >= week.dailySchedule.length) {
    return res.status(400).json({ message: "Target day index out of range." });
  }

  const clonedDay = cloneDay(week.dailySchedule[sourceDayIdx]);

  week.dailySchedule[targetIdx] = clonedDay;

  const updatedBlock = await block.save();

  return res.status(201).json({
    message: "Day schedule duplicated successfully.",
    block: updatedBlock,
  });
};

const duplicateExerciseEntry = async (req, res) => {
  const { athleteId, blockId, weekNumber, dayIndex, exerciseId } = req.params;
  const coachId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(blockId)) {
    return res.status(400).json({ message: "Invalid block ID." });
  }

  const dayIdx = parseInt(dayIndex, 10);

  const block = await Block.findOne({ _id: blockId, coach: coachId, athlete: athleteId });
  if (!block) {
    return res
      .status(404)
      .json({ message: "Block not found or access denied." });
  }

  const week = block.blockSchedule.find(
    (w) => w.weekNumber === parseInt(weekNumber, 10)
  );
  if (!week) {
    return res.status(404).json({ message: "Week not found." });
  }

  const day = week.dailySchedule[dayIdx];
  if (!day) {
    return res.status(404).json({ message: "Day not found." });
  }

  const exercise = day.exercises.find(
    (ex) => ex._id.toString() === exerciseId
  );
  if (!exercise) {
    return res.status(404).json({ message: "Exercise not found." });
  }

  const clonedExercise = cloneExercise(exercise);

  day.exercises.push(clonedExercise);

  const updatedBlock = await block.save();

  return res.status(201).json({
    message: "Exercise duplicated successfully.",
    block: updatedBlock,
  });
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
  duplicateWeek, 
  duplicateDailySchedule, 
  duplicateExerciseEntry, 
  deleteCoachExercise,
};
