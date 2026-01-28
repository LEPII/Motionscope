import mongoose from "mongoose";
import { weeklyScheduleSchema, dayEnum, primExercisesEnum } from "./block.js";
import Joi from "joi";

const savedBlockTemplateSchema = new mongoose.Schema({
  coach: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  templateName: { type: String, minLength: 1, maxLength: 50, required: true },
  numberOfWeeks: { type: Number, min: 1, max: 12, required: true },
  days: {
    type: [String],
    enum: dayEnum,
    required: true,
    validate: {
      validator: function (v) {
        return v.length > 0;
      },
      message: "Please select at least one day",
    },
  },
  blockSchedule: {
    type: [weeklyScheduleSchema],
    default: [],
  },
  createdAt: { type: Date, default: Date.now },
});

savedBlockTemplateSchema.pre("validate", function (next) {
  if (this.blockSchedule && this.blockSchedule.length > 0 && this.days) {
    for (const week of this.blockSchedule) {
      if (
        week.dailySchedule &&
        week.dailySchedule.length !== this.days.length
      ) {
        this.invalidate(
          "blockSchedule",
          `Each 'dailySchedule' must have ${this.days.length} items, matching the number of selected 'days'.`,
          week
        );
        return next();
      }
    }
  }
  next();
});

const SavedBlockTemplate = mongoose.model(
  "SavedBlockTemplate",
  savedBlockTemplateSchema
);

const exerciseEntryCoachSchema = Joi.object({
  exerciseId: Joi.string().hex().length(24).required(),
  sets: Joi.number().integer().min(0).max(20).required(),
  repsMin: Joi.number().integer().min(0).max(30).optional(),
  reps: Joi.number().integer().min(0).max(30).required(),
  prescribedLoadMin: Joi.number().min(0).max(100).optional(),
  prescribedLoad: Joi.number().min(0).max(100).required(),
  prescribedRPEMin: Joi.number().min(0).max(10).optional(),
  prescribedRPE: Joi.number().min(0).max(10).required(),
  cuesFromCoach: Joi.string().min(1).max(1000).optional(),
});

const dailyScheduleCoachSchema = Joi.object({
  primExercises: Joi.array()
    .items(Joi.string().valid(...primExercisesEnum))
    .min(1)
    .required(),
  exercises: Joi.array().items(exerciseEntryCoachSchema).default([]),
});

const weeklyScheduleCoachSchema = Joi.object({
  weekNumber: Joi.number().integer().min(1).required(),
  weekStartDate: Joi.date().iso().required(),
  dailySchedule: Joi.array().items(dailyScheduleCoachSchema).required(),
});

const savedBlockTemplateSchemaJoi = Joi.object({
  coach: Joi.string().hex().length(24).required(),
  templateName: Joi.string().min(1).max(50).required(),
  numberOfWeeks: Joi.number().integer().min(1).max(12).required(),
  days: Joi.array()
    .items(Joi.string().valid(...dayEnum))
    .min(1)
    .required(),
  blockSchedule: Joi.array().items(weeklyScheduleCoachSchema).optional(),
});

const createBlockFromTemplateSchema = Joi.object({
  athlete: Joi.string().hex().length(24).required(),
  blockName: Joi.string().min(1).max(50).optional(),
  blockStartDate: Joi.date().iso().required(),
  blockEndDate: Joi.date().iso().required(),
});

export {
  SavedBlockTemplate,
  savedBlockTemplateSchemaJoi,
  createBlockFromTemplateSchema,
};
