import Joi from "joi";
import mongoose from "mongoose";

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

const PresetExercise = mongoose.model("presetExercise", presetExerciseSchema);

function validatePresetExercises(presetExercises) {
  const presetExercisesSchema = {
    name: Joi.string().min(3).max(50).required(),
    description: Joi.string().min(10).max(1000).required(),
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

export { presetExerciseSchema, PresetExercise, validatePresetExercises };
