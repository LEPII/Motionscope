const Joi = require("joi");
const mongoose = require("mongoose");

const programSchema = new mongoose.Schema({
  coach: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  athlete: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  blocks: { type: mongoose.Schema.Types.ObjectId, ref: "Block" },
});
