import Joi from "joi";
import mongoose from "mongoose";

const primExercisesEnum = [
  "Primary Squat",
  "Primary Bench",
  "Primary Deadlift",
  "Secondary Squat",
  "Secondary Bench",
  "Secondary Deadlift",
  "Tertiary Squat",
  "Tertiary Bench",
  "Tertiary Deadlift",
  "Volume Squat",
  "Volume Bench",
  "Volume Deadlift",
];

const dayEnum = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const setSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["working", "warmup", "top", "drop"],
    required: true,
  },
  createdBy: {
    type: String,
    enum: ["coach", "athlete"],
    required: true,
  },

  // Coach's fields
  repsMin: { type: Number, min: 0, max: 30 },
  reps: { type: Number, min: 0, max: 30 },
  prescribedLoadMin: { type: Number, min: 0, max: 100 },
  prescribedLoad: { type: Number, min: 0, max: 100 },
  prescribedRPEMin: { type: Number, min: 0, max: 10 },
  prescribedRPE: { type: Number, min: 0, max: 10 },
  cuesFromCoach: { type: String, minLength: 1, maxLength: 1000 },

  // Athlete's fields
  actualReps: { type: Number, min: 0, max: 30 },
  actualLoad: { type: Number, min: 0, max: 10000 },
  actualRPEMin: { type: Number, min: 0, max: 10 },
  actualRPE: { type: Number, min: 0, max: 10 },
  sideNote: { type: String, minLength: 1, maxLength: 1000 },
  cuesNote: { type: String, minLength: 1, maxLength: 2000 },
});

const exerciseEntrySchema = new mongoose.Schema({
  exerciseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Exercise",
    required: true,
  },
  setsDetail: {
    type: [setSchema],
    validate: {
      validator: function (v) {
        return v.length > 0;
      },
      message: "At least one set must be provided.",
    },
  },
});

const dailyScheduleSchema = new mongoose.Schema({
  primExercises: {
    type: [String],
    enum: primExercisesEnum,
    required: true,
    validate: {
      validator: function (v) {
        return v.length > 0;
      },
      message: "Please select at least one title for the day.",
    },
  },
  exercises: [exerciseEntrySchema],
});

const weeklyScheduleSchema = new mongoose.Schema({
  weekNumber: { type: Number, required: true },
  weekStartDate: { type: Date, required: true },
  dailySchedule: [dailyScheduleSchema],
});

const blockSchema = new mongoose.Schema({
  coach: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  athlete: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  blockName: { type: String, minLength: 1, maxLength: 50, required: true },
  numberOfWeeks: {
    type: Number,
    min: 1,
    max: 12,
    required: true,
  },
  blockStartDate: {
    type: Date,
    required: true,
    validate: [
      {
        validator: function (value) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const startDate = new Date(value);
          startDate.setHours(0, 0, 0, 0);
          return startDate >= today;
        },
        message: "Block start date must be today or in the future.",
      },
      {
        validator: function (value) {
          const dayOfWeek = value.getDay();
          return dayOfWeek === 0;
        },
        message: "Block start date must be a Sunday.",
      },
    ],
  },
  blockEndDate: {
    type: Date,
    required: true,
    validate: [
      {
        validator: function (value) {
          if (!this.blockStartDate || !this.numberOfWeeks) {
            return true;
          }
          const expectedEndDate = new Date(this.blockStartDate);
          // adds the starts date + the length of the block
          expectedEndDate.setDate(
            expectedEndDate.getDate() + this.numberOfWeeks * 7 - 1
          );
          const actualEndDate = new Date(value);
          actualEndDate.setHours(0, 0, 0, 0);
          expectedEndDate.setHours(0, 0, 0, 0);
          // compares the ACTUAL end date provided by the user
          // WITH the EXPECTED end date calculated above.
          return actualEndDate.getTime() === expectedEndDate.getTime();
        },
        message:
          "Block end date does not match the block start date and number of weeks selected.",
      },
      {
        validator: function (value) {
          const dayOfWeek = value.getDay();
          return dayOfWeek === 6;
        },
        message: "Block end date must be a Saturday.",
      },
    ],
  },
  days: {
    type: [String],
    enum: dayEnum,
    validate: {
      validator: function (v) {
        return v.length > 0;
      },
      message: "Please select at least one day",
    },
    required: true,
  },
  blockSchedule: {
    type: [weeklyScheduleSchema],
    validate: {
      validator: function (weeks) {
        return !this.numberOfWeeks || weeks.length === this.numberOfWeeks;
      },
      message:
        "The number of weekly schedules in 'blockSchedule' must match 'numberOfWeeks'.",
    },
  },
});

blockSchema.pre("validate", function (next) {
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

blockSchema.pre("save", async function (next) {
  const Block = mongoose.model("Block");

  const overlappingBlock = await Block.findOne({
    athlete: this.athlete,
    _id: { $ne: this._id },
    $or: [
      {
        blockStartDate: { $lte: this.blockEndDate },
        blockEndDate: { $gte: this.blockStartDate },
      },
    ],
  });
  if (overlappingBlock) {
    const err = new Error(
      `Athlete already has a block overlapping this period: ${overlappingBlock.blockName}`
    );
    return next(err);
  }

  next();
});

const Block = mongoose.model("Block", blockSchema);

// Validation for coaches

const setCoachSchema = Joi.object({
  type: Joi.string().valid("working", "top", "drop").required(),
  createdBy: Joi.string().valid("coach").required(),

  repsMin: Joi.number().integer().min(0).max(30).optional(),
  reps: Joi.number().integer().min(0).max(30).required(),
  prescribedLoadMin: Joi.number().min(0).max(100).optional(),
  prescribedLoad: Joi.number().min(0).max(100).required(),
  prescribedRPEMin: Joi.number().min(0).max(10).optional(),
  prescribedRPE: Joi.number().min(0).max(10).required(),
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
  Block,
  blockCoachSchema,
  exerciseEntryCoachSchema,
  exerciseEntryAthleteSchema,
  weeklyScheduleSchema,
  primExercisesEnum,
  dayEnum,
};
