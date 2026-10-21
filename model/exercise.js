import mongoose from "mongoose";
import {
  exerciseTypeEnum,
  muscleGroupEnum,
  movementPatternEnum,
  loadTypeEquipmentEnum,
  typeOfExerciseEnum,
  unilateralBilateralEnum,
  prCategoryEnum,
} from "../constants/exercise.js";

const exerciseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: true,
      minLength: 3,
      maxLength: 100,
      unique: true,
    },
    type: {
      type: String,
      enum: exerciseTypeEnum,
      required: true,
      default: "custom",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    description: { type: String, minLength: 10, maxLength: 1000 },
    muscleGroup: {
      type: [String],
      enum: muscleGroupEnum,
    },
    movementPattern: {
      type: [String],
      enum: movementPatternEnum,
    },
    loadTypeEquipment: {
      type: [String],
      enum: loadTypeEquipmentEnum,
    },
    typeOfExercise: {
      type: String,
      enum: typeOfExerciseEnum,
      required: true,
    },
    unilateralBilateral: {
      type: [String],
      enum: unilateralBilateralEnum,
    },
    prCategory: {
      type: String,
      enum: [...prCategoryEnum, null],
    },
  },
  { timestamps: true }
);

exerciseSchema.index({ name: "text" });
exerciseSchema.index({ muscleGroup: 1 });
exerciseSchema.index({ movementPattern: 1 });
exerciseSchema.index({ loadTypeEquipment: 1 });
exerciseSchema.index({ typeOfExercise: 1 });
exerciseSchema.index({ createdBy: 1 });

const Exercise = mongoose.model("exercise", exerciseSchema);

export { exerciseSchema, Exercise };
