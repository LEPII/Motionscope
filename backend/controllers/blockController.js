import {
  Block,
  blockCoachSchema,
  exerciseEntryAthleteSchema,
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

  const savedBlock = await Block.create(blockData);

  res.status(201).json({
    message: "Block created successfully",
    block: savedBlock,
  });
};

const immutableFieldsForCoaches = [
  "actualLoad",
  "actualRPEMin",
  "actualRPE",
  "sideNote",
];

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

  const updatedBlock = await block.save();

  res.status(200).json({
    message: "Block updated successfully",
    block: updatedBlock,
  });
};

//
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

const postTemplateBlock = async (req, res) => {};

/// -- ATHLETE'S ENDPOINTS --

const getCurrentBlock = async (req, res) => {
  const singleBlock = await Block.findById(req.params.id);
  res.send(singleBlock);
};
const getAllAthleteBlocks = async (req, res) => {
  const allBlocks = await Block.find();
  res.send(allBlocks);
};

const updateAthleteBlock = async (req, res) => {
  const { blockId, exerciseId } = req.params;
  const athleteId = req.user._id;

  if (
    !mongoose.Types.ObjectId.isValid(blockId) ||
    !mongoose.Types.ObjectId.isValid(exerciseId)
  ) {
    return res.status(400).json({ message: "Invalid block or exercise ID." });
  }

  const { error, value } = exerciseEntryAthleteSchema.validate(req.body, {
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
          Object.assign(ex, value);
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

  res.status(200).json({
    message: "Exercise updated successfully",
    block: updatedBlock,
  });
};

export {
  getSingleBlock,
  getAllBlocks,
  postBlock,
  updateBlock,
  deleteBlock,
  postTemplateBlock,
  getCurrentBlock,
  getAllAthleteBlocks,
  updateAthleteBlock,
};
