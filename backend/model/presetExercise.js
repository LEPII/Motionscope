const mongoose = require("mongoose");

const presetExerciseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: String,
    muscleGroup: {
      type: String,
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

exports.presetExerciseSchema = presetExerciseSchema;
exports.presetExercise = presetExercise;
