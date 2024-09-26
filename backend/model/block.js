const Joi = require("joi");
const mongoose = require("mongoose");

const blockSchema = new mongoose.Schema(
  {
    weekDateStart: {
      type: Date,
      required: true,
    },
    weekDateEnd: {
      type: Date,
      required: true,
    },
    numberOfWeeks: {
      type: Number,
      min: 1,
      max: 12,
      required: true,
    },
    days: {
      type: String,
      enum: [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
      required: true,
    },
    primExercises: {
      type: String,
      required: true,
      enum: [
        "Primary Squat",
        "Secondary Squat",
        "Volume Squat",
        "Primary Bench",
        "Secondary Bench",
        "Volume Bench",
        "Primary Deadlift",
        "Secondary Deadlift",
        "Volume Deadlift",
      ],
    },
    exercise: { type: mongoose.Schema.Types.ObjectId, ref: "Exercise" },
    presetExercise: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PresetExercise",
    },
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
    actualLoadMin: { type: Number, min: 0, max: 10000 },
    actualLoadMax: { type: Number, min: 0, max: 10000, required: true },
    actualRPEMin: { type: Number, min: 0, max: 10 },
    actualRPEMax: { type: Number, min: 0, max: 10, required: true },
    sideNote: { type: String, minLength: 1, maxLength: 300 },
  },
  { timestamps: true }
);

const Block = mongoose.model("Block", blockSchema);

exports.blockSchema = blockSchema;
exports.Block = Block;
