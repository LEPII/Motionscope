const Joi = require("joi");
const mongoose = require("mongoose");

const presetExerciseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: true,
      minLength: 3,
      maxLength: 50,
      unique: true,
    },
    description: { type: String, minLength: 10, maxLength: 1000 },
    sets: {
      type: Number,
      min: 0,
      max: 10,
      required: true,
    },
    repsMin: { type: Number, min: 0, max: 30 },
    repsMax: { type: Number, min: 0, max: 30 },
    prescribedLoadMin: { type: Number, min: 0, max: 100 },
    prescribedLoadMax: { type: Number, min: 0, max: 100 },
    prescribedRPEMin: { type: Number, min: 0, max: 10 },
    prescribedRPEMax: { type: Number, min: 0, max: 10 },
    actualLoadMin: { type: Number, min: 0, max: 10000 },
    actualLoadMax: { type: Number, min: 0, max: 10000 },
    actualRPEMin: { type: Number, min: 0, max: 10 },
    actualRPEMax: { type: Number, min: 0, max: 10 },
    cuesFromCoach: { type: String, minLength: 3, maxLength: 1000 },
    sideNote: { type: String, minLength: 1, maxLength: 1000 },
    muscleGroup: {
      type: [String],
      enum: [
        "Chest",
        "Back",
        "Shoulders",
        "Core",
        "Lats",
        "Traps",
        "Deltoids",
        "Biceps",
        "Triceps",
        "Forearms",
        "Quadriceps",
        "Hamstrings",
        "Calves",
        "Glutes",
        "Abdominals",
        "Obliques",
      ],
    },
  },
  { timestamps: true }
);

const presetExercise = mongoose.model("presetExercise", presetExerciseSchema);

function validatePresetExercises(presetExercises) {
  const presetExercisesSchema = {
    name: Joi.string().min(3).max(50).required(),
    description: Joi.string().min(10).max(100).required(),
    sets: Joi.number().min(0).max(10).required(),
    repsMin: Joi.number().min(0).max(30).required(),
    repsMax: Joi.number().min(0).max(30).required(),
    prescribedLoadMin: Joi.number().min(0).max(100).required(),
    prescribedLoadMax: Joi.number().min(0).max(100).required(),
    prescribedRPEMin: Joi.number().min(0).max(10).required(),
    prescribedRPEMax: Joi.number().min(0).max(10).required(),
    actualLoadMin: Joi.number().min(0).max(10000).required(),
    actualLoadMax: Joi.number().min(0).max(10000).required(),
    actualRPEMin: Joi.number().min(0).max(10).required(),
    actualRPEMax: Joi.number().min(0).max(10).required(),
    cuesFromCoach: Joi.string().min(3).max(1000),
    sideNote: Joi.string().min(1).max(1000),
    muscleGroup: Joi.array()
      .items(
        Joi.string().valid(
          "Chest",
          "Back",
          "Shoulders",
          "Core",
          "Lats",
          "Traps",
          "Deltoids",
          "Biceps",
          "Triceps",
          "Forearms",
          "Quadriceps",
          "Hamstrings",
          "Calves",
          "Glutes",
          "Abdominals",
          "Obliques"
        )
      )
      .required(),
  };
  return Joi.validate(presetExercises, presetExercisesSchema);
}

exports.presetExerciseSchema = presetExerciseSchema;
exports.presetExercise = presetExercise;
exports.validatePresetExercises = validatePresetExercises;
