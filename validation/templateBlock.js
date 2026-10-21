import Joi from "./common.js";
import { primExercisesEnum, dayEnum } from "../constants/block.js";

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

export { savedBlockTemplateSchemaJoi, createBlockFromTemplateSchema };
