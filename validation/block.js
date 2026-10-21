import Joi from "./common.js";
import { primExercisesEnum, dayEnum } from "../constants/block.js";

// Validation for coaches

const setCoachSchema = Joi.object({
  type: Joi.string().valid("working", "top", "drop").required(),
  createdBy: Joi.string().valid("coach").required(),

  repsMin: Joi.number().integer().min(0).max(30).optional(),
  reps: Joi.number().integer().min(0).max(30).required(),
  prescribedLoadMin: Joi.number().min(0).max(100).optional(),
  prescribedLoad: Joi.number().min(0).max(100).optional(),
  prescribedRPEMin: Joi.number().min(0).max(10).optional(),
  prescribedRPE: Joi.number().min(0).max(10).required(),
  targetLoadMin: Joi.forbidden(),
  targetLoad: Joi.forbidden(),
  cuesFromCoach: Joi.string().min(1).max(1000).optional(),

  // athlete-only fields blocked for coaches
  actualReps: Joi.forbidden(),
  actualLoad: Joi.forbidden(),
  actualRPEMin: Joi.forbidden(),
  actualRPE: Joi.forbidden(),
  sideNote: Joi.forbidden(),
  cuesNote: Joi.forbidden(),
}).custom((value, helpers) => {
  if (value.type === "warmup") {
    return helpers.error("any.invalid", {
      message: "Coaches cannot create warmup sets.",
    });
  }
  return value;
}, "Coach set restrictions");

const exerciseEntryCoachSchema = Joi.object({
  exerciseId: Joi.string().hex().length(24).required(),
  setsDetail: Joi.array().items(setCoachSchema).min(1).required().messages({
    "array.min": "At least one set must be provided for this exercise.",
    "any.required": "Sets detail is required.",
  }),
});

const dailyScheduleCoachSchema = Joi.object({
  primExercises: Joi.array()
    .items(Joi.string().valid(...primExercisesEnum))
    .min(1)
    .required()
    .messages({
      "array.min": "Please select at least one title for the day.",
      "any.required": "Primary exercises are required.",
    }),
  exercises: Joi.array().items(exerciseEntryCoachSchema).default([]),
});

const weeklyScheduleCoachSchema = Joi.object({
  weekNumber: Joi.number().integer().min(1).required(),
  weekStartDate: Joi.date().iso().required(),
  dailySchedule: Joi.array().items(dailyScheduleCoachSchema).required(),
});

const blockCoachSchema = Joi.object({
  coach: Joi.string().hex().length(24).required(),
  athlete: Joi.string().hex().length(24).required(),
  isArchived: Joi.boolean().optional(),
  blockName: Joi.string().min(1).max(50).required(),
  numberOfWeeks: Joi.number().integer().min(1).max(12).required(),
  blockStartDate: Joi.date().iso().required(),
  blockEndDate: Joi.date().iso().required(),
  days: Joi.array()
    .items(Joi.string().valid(...dayEnum))
    .min(1)
    .required(),
  blockSchedule: Joi.array().items(weeklyScheduleCoachSchema).optional(),
});

// Athlete's validation

const setAthleteSchema = Joi.object({
  type: Joi.string().valid("warmup").required(),
  createdBy: Joi.string().valid("athlete").required(),

  // coach fields forbidden for athletes
  repsMin: Joi.forbidden(),
  reps: Joi.forbidden(),
  prescribedLoadMin: Joi.forbidden(),
  prescribedLoad: Joi.forbidden(),
  prescribedRPEMin: Joi.forbidden(),
  prescribedRPE: Joi.forbidden(),
  targetLoadMin: Joi.forbidden(),
  targetLoad: Joi.forbidden(),
  cuesFromCoach: Joi.forbidden(),

  // athlete editable fields
  actualReps: Joi.number().min(0).max(30).required(),
  actualLoad: Joi.number().min(0).max(10000).required(),
  actualRPEMin: Joi.number().min(0).max(10).optional(),
  actualRPE: Joi.number().min(0).max(10).required(),
  sideNote: Joi.string().max(1000).optional(),
  cuesNote: Joi.string().max(2000).optional(),
}).custom((value, helpers) => {
  if (value.createdBy === "athlete" && value.type !== "warmup") {
    return helpers.error("any.invalid", {
      message:
        "Athletes may only create warmup sets. Working/top/drop sets must come from the coach.",
    });
  }

  if (value.createdBy === "athlete" && value.type === "warmup") {
    if (!value.actualLoad && !value.actualRPE && !value.sideNote) {
      return helpers.error("any.invalid", {
        message:
          "Warmup sets must include at least actualLoad, actualRPE, or a note.",
      });
    }
  }

  return value;
}, "Set type restrictions");

const exerciseEntryAthleteSchema = Joi.object({
  exerciseId: Joi.string().hex().length(24).required(),
  setsDetail: Joi.array().items(setAthleteSchema).min(1).required(),
});

const dailyScheduleAthleteSchema = Joi.object({
  exercises: Joi.array().items(exerciseEntryAthleteSchema).default([]),
});

const weeklyScheduleAthleteSchema = Joi.object({
  dailySchedule: Joi.array().items(dailyScheduleAthleteSchema).optional(),
});

export {
  setCoachSchema,
  exerciseEntryCoachSchema,
  dailyScheduleCoachSchema,
  weeklyScheduleCoachSchema,
  blockCoachSchema,
  setAthleteSchema,
  exerciseEntryAthleteSchema,
  dailyScheduleAthleteSchema,
  weeklyScheduleAthleteSchema,
};
