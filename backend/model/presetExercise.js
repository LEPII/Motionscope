const mongoose = require("mongoose");

const presetExerciseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: true,
    },
    description: { type: String, minLength: 1, maxLength: 1000 },
    sets: {
      type: Number,
      min: 0,
      max: 10,
      required: true,
    },
    repsMin: { type: Number, min: 0, max: 30 },
    repsMax: { type: Number, min: 0, max: 30, required: true },
    prescribedLoadMin: { type: Number, min: 0, max: 100 },
    prescribedLoadMax: { type: Number, min: 0, max: 100, required: true },
    prescribedRPEMin: { type: Number, min: 0, max: 10 },
    prescribedRPEMax: { type: Number, min: 0, max: 10, required: true },
    actualLoadMin: { type: Number, min: 0, max: 10000 },
    actualLoadMax: { type: Number, min: 0, max: 10000, required: true },
    actualRPEMin: { type: Number, min: 0, max: 10 },
    actualRPEMax: { type: Number, min: 0, max: 10, required: true },
    cuesFromCoach: { type: String, minLength: 1, maxLength: 1000 },
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

exports.presetExerciseSchema = presetExerciseSchema;
exports.presetExercise = presetExercise;
