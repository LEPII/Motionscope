import {
  Block,
  blockCoachSchema,
  exerciseEntryAthleteSchema,
  exerciseEntryCoachSchema,
} from "../model/block.js";
import mongoose from "mongoose";

/// -- COACH'S ENDPOINTS --

const getSingleBlock = async (req, res) => {
  const singleBlock = await Block.findById(req.params.id);
  res.send(singleBlock);
};

const getAllBlocks = async (req, res) => {
  const allBlocks = await Block.find();
  res.send(allBlocks);
};

const postBlock = async (req, res) => {
  const { athleteId } = req.params.athleteId;
  const coachId = req.user._id;

  const { error, value } = blockCoachSchema.validate(req.body, {
    abortEarly: false,
    allowUnknown: false,
  });

  if (error) {
    return res.status(400).json({
      message: "Validation failed",
      details: error.details.map((d) => d.message),
    });
  }

  const blockData = { ...value, coach: coachId, athlete: athleteId };
  const { programId } = req.body;

  try {
    session.startTransaction();
    const program = await Program.findById(programId).session(session);
    if (!program) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Program not found" });
    }

    const [savedBlock] = await Block.create([blockData], { session });

    program.blocks.push(savedBlock._id);
    await program.save({ session });

    await session.commitTransaction();

    return res.status(201).json({
      message: "Block created and added to Program",
      block: savedBlock,
    });
  } catch (err) {
    await session.abortTransaction();
    console.error("Transaction failed:", err);
    return res.status(500).json({
      message: "Something went wrong",
      error: err.message,
    });
  } finally {
    await session.endSession();
  }
};

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

const updateBlock = async (req, res) => {
  const { blockId } = req.params;
  const coachId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(blockId)) {
    return res.status(400).json({ message: "Invalid block ID." });
  }

  const { error, value } = blockCoachSchema.validate(req.body, {
    abortEarly: false,
    allowUnknown: false,
    presence: "optional",
  });

  if (error) {
    return res.status(400).json({
      message: "Validation failed",
      details: error.details.map((d) => d.message),
    });
  }

  const block = await Block.findOne({ _id: blockId, coach: coachId });
  if (!block) {
    return res
      .status(404)
      .json({ message: "Block not found or access denied." });
  }

  Object.keys(value).forEach((key) => {
    block[key] = value[key];
  });

  // If numberOfWeeks decreased, frontend warning message expected
  if (value.numberOfWeeks && value.numberOfWeeks < block.blockSchedule.length) {
    block.blockSchedule = block.blockSchedule.slice(0, value.numberOfWeeks);
  }

  const updatedBlock = await block.save();

  res.status(200).json({
    message: "Block updated successfully",
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

const deleteBlock = async (req, res) => {
  const { athleteId, blockId } = req.params;

  if (
    !mongoose.Types.ObjectId.isValid(athleteId) ||
    !mongoose.Types.ObjectId.isValid(blockId)
  ) {
    return res.status(400).json({ message: "Invalid athlete or block ID." });
  }

  const deletedBlock = await Block.findOneAndDelete({
    _id: blockId,
    athlete: athleteId,
    coach: req.user._id,
  });

  if (!deletedBlock) {
    return res
      .status(404)
      .json({ message: "Block not found or access denied." });
  }

  res.status(200).json({
    message: "Block deleted successfully",
    block: deletedBlock,
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

/// -- ATHLETE'S ENDPOINTS --

const getCurrentBlock = async (req, res) => {
  const singleBlock = await Block.findById(req.params.id);
  res.send(singleBlock);
};
const getAllAthleteBlocks = async (req, res) => {
  const allBlocks = await Block.find();
  res.send(allBlocks);
};

const updateAthleteSet = async (req, res) => {
  const { blockId, exerciseId, setId } = req.params;
  const athleteId = req.user._id;

  if (
    !mongoose.Types.ObjectId.isValid(blockId) ||
    !mongoose.Types.ObjectId.isValid(exerciseId) ||
    !mongoose.Types.ObjectId.isValid(setId)
  ) {
    return res.status(400).json({ message: "Invalid ID(s)." });
  }

  const block = await Block.findOne({ _id: blockId, athlete: athleteId });
  if (!block) {
    return res
      .status(404)
      .json({ message: "Block not found or access denied." });
  }

  let setUpdated = false;

  for (const week of block.blockSchedule || []) {
    for (const day of week.dailySchedule || []) {
      for (const ex of day.exercises || []) {
        if (ex._id.toString() === exerciseId) {
          const set = ex.setsDetail.id(setId);
          if (!set) continue;

          if (set.createdBy === "coach") {
            const allowedFields = [
              "actualReps",
              "actualLoad",
              "actualRPEMin",
              "actualRPE",
              "sideNote",
              "cuesNote",
            ];
            Object.keys(req.body).forEach((key) => {
              if (allowedFields.includes(key)) {
                set[key] = req.body[key];
              }
            });
            setUpdated = true;
          } else if (set.createdBy === "athlete" && set.type === "warmup") {
            const allowedFields = ["actualReps", "actualLoad"];
            Object.keys(req.body).forEach((key) => {
              if (allowedFields.includes(key)) {
                set[key] = req.body[key];
              }
            });
            setUpdated = true;
          } else {
            return res.status(403).json({
              message:
                "You can only edit coach-created sets or your own warmup sets.",
            });
          }

          break;
        }
      }
      if (setUpdated) break;
    }
    if (setUpdated) break;
  }

  if (!setUpdated) {
    return res.status(404).json({ message: "Set not found." });
  }

  const updatedBlock = await block.save();

  res.status(200).json({
    message: "Set updated successfully",
    block: updatedBlock,
  });
};

const postWarmUpAthleteSet = async (req, res) => {
  const { blockId, exerciseId } = req.params;
  const athleteId = req.user._id;

  if (
    !mongoose.Types.ObjectId.isValid(blockId) ||
    !mongoose.Types.ObjectId.isValid(exerciseId)
  ) {
    return res.status(400).json({ message: "Invalid block or exercise ID." });
  }

  const { error, value } = setAthleteSchema.validate(req.body, {
    abortEarly: false,
    allowUnknown: false,
  });

  if (error) {
    return res.status(400).json({
      message: "Validation failed",
      details: error.details.map((d) => d.message),
    });
  }

  const newSet = {
    ...value,
    type: "warmup",
    createdBy: "athlete",
    createdAt: new Date(),
  };

  const block = await Block.findOne({ _id: blockId, athlete: athleteId });
  if (!block) {
    return res
      .status(404)
      .json({ message: "Block not found or access denied." });
  }

  let exerciseFound = false;

  for (const week of block.blockSchedule || []) {
    for (const day of week.dailySchedule || []) {
      for (const ex of day.exercises || []) {
        if (ex._id.toString() === exerciseId) {
          ex.setsDetail.push(newSet);
          exerciseFound = true;
          break;
        }
      }
      if (exerciseFound) break;
    }
    if (exerciseFound) break;
  }

  if (!exerciseFound) {
    return res
      .status(404)
      .json({ message: "Exercise not found in this block." });
  }

  const updatedBlock = await block.save();

  res.status(201).json({
    message: "Warmup set added successfully",
    block: updatedBlock,
  });
};

const deleteWarmUpAthleteSet = async (req, res) => {
  const { blockId, exerciseId, setId } = req.params;
  const athleteId = req.user._id;

  if (
    !mongoose.Types.ObjectId.isValid(blockId) ||
    !mongoose.Types.ObjectId.isValid(exerciseId) ||
    !mongoose.Types.ObjectId.isValid(setId)
  ) {
    return res.status(400).json({ message: "Invalid ID(s)." });
  }

  const block = await Block.findOne({ _id: blockId, athlete: athleteId });
  if (!block) {
    return res
      .status(404)
      .json({ message: "Block not found or access denied." });
  }

  let setDeleted = false;

  for (const week of block.blockSchedule || []) {
    for (const day of week.dailySchedule || []) {
      for (const ex of day.exercises || []) {
        if (ex._id.toString() === exerciseId) {
          const setIndex = ex.setsDetail.findIndex(
            (set) => set._id.toString() === setId
          );

          if (setIndex === -1) continue;

          const set = ex.setsDetail[setIndex];

          if (set.createdBy !== "athlete" || set.type !== "warmup") {
            return res.status(403).json({
              message:
                "You can only delete warmup sets that you created yourself.",
            });
          }

          ex.setsDetail.splice(setIndex, 1);
          setDeleted = true;
          break;
        }
      }
      if (setDeleted) break;
    }
    if (setDeleted) break;
  }

  if (!setDeleted) {
    return res.status(404).json({ message: "Set not found." });
  }

  const updatedBlock = await block.save();

  res.status(200).json({
    message: "Warmup set deleted successfully",
    block: updatedBlock,
  });
};

export {
  getSingleBlock,
  getAllBlocks,
  postBlock,
  postCoachExercise,
  updateBlock,
  deleteCoachExercise,
  updateWeeklySchedule,
  updateDailySchedule,
  updateSet,
  deleteBlock,
  getCurrentBlock,
  getAllAthleteBlocks,
  updateAthleteSet,
  postWarmUpAthleteSet,
  deleteWarmUpAthleteSet,
};
