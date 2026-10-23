import { Block } from "../model/block.js";
import { SavedBlockTemplate } from "../model/templateBlock.js";
import mongoose from "mongoose";
import { Program } from "../model/program.js";
import { AthleteStats } from "../model/stats.js";
import { populateBlockTargetLoads } from "../utils/trainingLoad.js";

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
  const { athleteId } = req.params;
  const coachId = req.user._id;


  const blockData = { ...req.body, coach: coachId, athlete: athleteId };
  const { programId } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const program = await Program.findById(programId).session(session);
    if (!program) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Program not found" });
    }

    const athleteStats = await AthleteStats.findOne({
      user: athleteId,
    }).session(session);

    const block = new Block(blockData);

    await populateBlockTargetLoads(block, athleteStats);

    const savedBlock = await block.save({ session });

    program.blocks.push(savedBlock._id);
    await program.save({ session });

    await session.commitTransaction();

    return res.status(201).json({
      message: "Block created and added to Program",
      block: savedBlock,
    });
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    await session.endSession();
  }
};

const checkIfPrescribedLoadsChanged = (updatedPayload) => {
  if (!updatedPayload.blockSchedule) return false;

  const updatedWeeks = updatedPayload.blockSchedule;

  for (let w = 0; w < updatedWeeks.length; w++) {
    const updatedWeek = updatedWeeks[w];
    if (!updatedWeek?.dailySchedule) continue;

    for (let d = 0; d < updatedWeek.dailySchedule.length; d++) {
      const updatedDay = updatedWeek.dailySchedule[d];
      if (!updatedDay?.exercises) continue;

      for (let e = 0; e < updatedDay.exercises.length; e++) {
        const updatedExercise = updatedDay.exercises[e];
        if (!updatedExercise?.setsDetail) continue;

        for (const set of updatedExercise.setsDetail) {
          if (
            set.prescribedLoad != null ||
            set.prescribedLoadMin != null ||
            set.prescribedRPE != null ||
            set.prescribedRPEMin != null
          ) {
            return true;
          }
        }
      }
    }
  }

  return false;
};

const updateBlock = async (req, res) => {
  const { blockId } = req.params;
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

  const value = req.body;
  Object.keys(value).forEach((key) => {
    block[key] = value[key];
  });

  // If numberOfWeeks decreased, frontend warning message expected
  if (value.numberOfWeeks && value.numberOfWeeks < block.blockSchedule.length) {
    block.blockSchedule = block.blockSchedule.slice(0, value.numberOfWeeks);
  }

  const requiresLoadRecalc = checkIfPrescribedLoadsChanged(value);

  if (requiresLoadRecalc) {
    const athleteStats = await AthleteStats.findOne({ user: block.athlete });
    await populateBlockTargetLoads(block, athleteStats); 
  }

  const updatedBlock = await block.save();

  res.status(200).json({
    message: "Block updated successfully",
    block: updatedBlock,
  });
};

const toggleBlockArchive = async (req, res) => {
  const coachId = req.user._id;
  const { blockId } = req.params;
  const { archive } = req.body;

  if (typeof archive !== "boolean") {
    return res
      .status(400)
      .json({ message: 'Invalid request: "archive" must be a boolean.' });
  }

  if (!mongoose.Types.ObjectId.isValid(blockId)) {
    return res.status(400).json({ message: "Invalid block ID." });
  }

  const block = await Block.findOneAndUpdate(
    {
      _id: blockId,
      coach: coachId, 
    },
    { $set: { isArchived: archive } },
    { new: true }
  );

  if (!block) {
    return res.status(404).json({ message: "Block not found or access denied." });
  }

  const statusMessage = archive ? "archived" : "unarchived";

  return res.status(200).json({
    message: `Block ${statusMessage} successfully`,
    block,
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
  toggleBlockArchive,
  deleteBlock,
  createBlockFromTemplate,
  getCurrentBlock,
  getAllAthleteBlocks,
};
