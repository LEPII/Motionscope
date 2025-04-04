import Joi from "joi";
import mongoose from "mongoose";

const programSchema = new mongoose.Schema({
  coach: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  athlete: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  blocks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Block" }],
  compDays: [{ type: mongoose.Schema.Types.ObjectId, ref: "CompDay" }],
});

const Program = mongoose.model("Program", programSchema);

export { Program };
