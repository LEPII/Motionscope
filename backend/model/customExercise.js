const Joi = require("joi");
const mongoose = require("mongoose");

const exerciseSchema = new mongoose.Schema(
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

const Exercise = mongoose.model("Exercise", exerciseSchema);

function validateCustomExercises(customExercises) {
  const customExercisesSchema = {
    name: Joi.string().min(3).max(50).required(),
    description: Joi.string().min(10).max(100).required(),
    sets: Joi.number().min(0).max(10),
    repsMin: Joi.number().min(0).max(30),
    repsMax: Joi.number().min(0).max(30),
    prescribedLoadMin: Joi.number().min(0).max(100),
    prescribedLoadMax: Joi.number().min(0).max(100),
    prescribedRPEMin: Joi.number().min(0).max(10),
    prescribedRPEMax: Joi.number().min(0).max(10),
    actualLoadMin: Joi.number().min(0).max(10000),
    actualLoadMax: Joi.number().min(0).max(10000),
    actualRPEMin: Joi.number().min(0).max(10),
    actualRPEMax: Joi.number().min(0).max(10),
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
  return Joi.validate(customExercises, customExercisesSchema);
}

exports.Exercise = Exercise;
exports.validateCustomExercises = validateCustomExercises;