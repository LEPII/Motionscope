// @ts-nocheck — reference file, not compiled. Import paths are written as if this file lived at
// model/exercise.ts, so they don't resolve from .claude/skills/. Copy the patterns, keep the paths.
// Example: TypeScript translation of model/exercise.js, following conventions/SKILL.md.
// Changes vs. the source file:
//   - model name "exercise" -> "Exercise", so it matches ref: "Exercise" in model/block.js (backlog #21)
//   - duplicate `unique: true` on `name` removed
//   - types derived with InferSchemaType instead of a hand-written interface

import mongoose, { type HydratedDocument, type InferSchemaType } from "mongoose";
import {
  exerciseTypeEnum,
  muscleGroupEnum,
  movementPatternEnum,
  loadTypeEquipmentEnum,
  typeOfExerciseEnum,
  unilateralBilateralEnum,
  prCategoryEnum,
} from "../constants/exercise.js"; // keep .js even when the target is .ts (NodeNext)

const exerciseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true, // top-level field, so a collection-wide unique index is what we want
      trim: true,
      minLength: 3,
      maxLength: 100,
    },
    type: {
      type: String,
      enum: exerciseTypeEnum,
      required: true,
      default: "custom",
    },
    // Author of a custom exercise. Ref -> singular noun, no `Id` suffix (it holds a User once populated)
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    description: { type: String, minLength: 10, maxLength: 1000 },
    muscleGroup: { type: [String], enum: muscleGroupEnum },
    movementPattern: { type: [String], enum: movementPatternEnum },
    loadTypeEquipment: { type: [String], enum: loadTypeEquipmentEnum },
    typeOfExercise: {
      type: String,
      enum: typeOfExerciseEnum,
      required: true,
    },
    unilateralBilateral: { type: [String], enum: unilateralBilateralEnum },
    // null = not tied to a competition lift. utils/trainingLoad.js uses it to pick the athlete's 1RM.
    prCategory: { type: String, enum: [...prCategoryEnum, null] },
  },
  { timestamps: true },
);

// Indexes back the filters in getExercises (text search, muscleGroup, movementPattern, ...)
exerciseSchema.index({ name: "text" });
exerciseSchema.index({ muscleGroup: 1 });
exerciseSchema.index({ movementPattern: 1 });
exerciseSchema.index({ loadTypeEquipment: 1 });
exerciseSchema.index({ typeOfExercise: 1 });
exerciseSchema.index({ createdBy: 1 });

type Exercise = InferSchemaType<typeof exerciseSchema>;
type ExerciseDoc = HydratedDocument<Exercise>;

const Exercise = mongoose.model("Exercise", exerciseSchema);

export { Exercise, exerciseSchema, type ExerciseDoc };
