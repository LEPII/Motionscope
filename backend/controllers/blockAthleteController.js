import { Block } from "../model/block.js";
import mongoose from "mongoose";

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

export { updateAthleteSet, postWarmUpAthleteSet, deleteWarmUpAthleteSet };
