import {
  Block,
  blockCoachSchema,
} from "../model/block.js";
import { SavedBlockTemplate } from "../model/templateBlock.js";
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

const createBlockFromTemplate = async (req, res) => {
  const { error } = blockCoachSchema.validate(req.body);
  if (error) {
    logger.warn(`Block validation failed: ${error.details[0].message}`);
    return res.status(400).send(error.details[0].message);
  }

  const { templateId } = req.params;
  const { coachId } = req.user._id;
  const {
    athlete,
    blockName,
    numberOfWeeks,
    days,
    blockSchedule,
    blockStartDate,
    blockEndDate,
  } = req.body;

  const template = await SavedBlockTemplate.findById(templateId);
  if (!template) return res.status(404).json({ message: "Template not found" });

  const block = new Block({
    coach: coachId,
    athlete,
    blockName: blockName || template.blockName,
    numberOfWeeks: numberOfWeeks || template.numberOfWeeks,
    days: days || template.days,
    blockSchedule: blockSchedule || template.blockSchedule,
    blockStartDate: blockStartDate || template.blockStartDate,
    blockEndDate: blockEndDate || template.blockEndDate,
  });

  await block.save();

  logger.info(`Block created from template by coach ${coachId}: ${block._id}`);

  res.status(201).json(block);
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

export {
  getSingleBlock,
  getAllBlocks,
  postBlock,
  updateBlock,
  deleteBlock,
  createBlockFromTemplate,
  getCurrentBlock,
  getAllAthleteBlocks,
};
