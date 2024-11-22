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
    },
    description: { type: String, minLength: 10, maxLength: 1000 },
    sets: {
      type: Number,
      min: 0,
      max: 10,
      required: true,
    },
    repsMin: { type: Number, min: 0, max: 30 },
    repsMax: { type: Number, min: 0, max: 30,},
    prescribedLoadMin: { type: Number, min: 0, max: 100 },
    prescribedLoadMax: { type: Number, min: 0, max: 100, },
    prescribedRPEMin: { type: Number, min: 0, max: 10 },
    prescribedRPEMax: { type: Number, min: 0, max: 10,  },
    actualLoadMin: { type: Number, min: 0, max: 10000 },
    actualLoadMax: { type: Number, min: 0, max: 10000, },
    actualRPEMin: { type: Number, min: 0, max: 10 },
    actualRPEMax: { type: Number, min: 0, max: 10, },
    cuesFromCoach: { type: String, minLength: 10, maxLength: 1000 },
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
    name: Joi.string().required(),
    description: Joi.string(),
    sets: Joi.number(),
    repsMin: Joi.number(),
    repsMax: Joi.number(),
    prescribedLoadMin: Joi.number(),
    prescribedLoadMax: Joi.number(),
    prescribedRPEMin: Joi.number(),
    prescribedRPEMax: Joi.number(),
    actualLoadMin: Joi.number(),
    actualLoadMax: Joi.number(),
    actualRPEMin: Joi.number(),
    actualRPEMax: Joi.number(),
    cuesFromCoach: Joi.string(),
    sideNote: Joi.string(),
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

exports.exerciseSchema = exerciseSchema;
exports.Exercise = Exercise;
