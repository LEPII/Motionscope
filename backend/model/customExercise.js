import Joi from "joi";
import mongoose from "mongoose";

const customExerciseSchema = new mongoose.Schema(
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
      max: 20,
    },
    repsMin: { type: Number, min: 0, max: 30 },
    reps: { type: Number, min: 0, max: 30 },
    prescribedLoadMin: { type: Number, min: 0, max: 100 },
    prescribedLoad: { type: Number, min: 0, max: 100 },
    prescribedRPEMin: { type: Number, min: 0, max: 10 },
    prescribedRPE: { type: Number, min: 0, max: 10 },
    actualLoad: { type: Number, min: 0, max: 10000 },
    actualRPEMin: { type: Number, min: 0, max: 10 },
    actualRPE: { type: Number, min: 0, max: 10 },
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

const CustomExercise = mongoose.model("customExercise", customExerciseSchema);

function validateCustomExercises(customExercises) {
  const customExercisesSchema = {
    name: Joi.string().min(3).max(50).required(),
    description: Joi.string().min(10).max(1000),
    sets: Joi.number().min(0).max(20),
    repsMin: Joi.number().min(0).max(30),
    reps: Joi.number().min(0).max(30),
    prescribedLoadMin: Joi.number().min(0).max(100),
    prescribedLoad: Joi.number().min(0).max(100),
    prescribedRPEMin: Joi.number().min(0).max(10),
    prescribedRPE: Joi.number().min(0).max(10),
    actualLoad: Joi.number().min(0).max(10000),
    actualRPEMin: Joi.number().min(0).max(10),
    actualRPE: Joi.number().min(0).max(10),
    cuesFromCoach: Joi.string().min(3).max(1000),
    sideNote: Joi.string().min(1).max(1000),
    muscleGroup: Joi.array().items(
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
    ),
  };
  return Joi.validate(customExercises, customExercisesSchema);
}

export { customExerciseSchema, CustomExercise, validateCustomExercises };
