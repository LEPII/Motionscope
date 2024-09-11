const Joi = require("joi");
const mongoose = require("mongoose");

const blockSchema = new mongoose.Schema({
  weekDateStart: {
    type: Date,
    required: true,
  },
  weekDateEnd: {
    type: Date,
    required: true,
  },
  days: {
    enum: [Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday],
    required: true,
  },
  primExercises: {
    type: String,
    required: true,
    minLength: 1,
    maxLength: 100,
  },
  exercise: { type: mongoose.Schema.Types.ObjectId, ref: "Exercise" },
  sets: {
    type: Number,
    required: true,
  },
  repsMin: { type: Number, min: 0, max: 30 },
  repsMax: { type: Number, min: 0, max: 30, required: true },
  prescribedLoadMin: { type: Number, min: 0, max: 10 },
  prescribedLoadMax: { type: Number, min: 0, max: 100, required: true },
  prescribedRPEMin: { type: Number, min: 0, max: 100 },
  prescribedRPEMax: { type: Number, min: 0, max: 100, required: true },
  actualLoad: { type: Number, min: 0, max: 10000 },
  actualRPE: { type: Number, min: 0, max: 10 },
  sideNote: { type: String, minLength: 1, maxLength: 300 },
});

const Block = mongoose.model("Block", blockSchema);
