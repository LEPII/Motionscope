import Joi from "joi";
import mongoose from "mongoose";
import JoiObjectId from "joi-objectid";

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
    enum: [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ],
    validate: {
      validator: function (v) {
        return v.length > 0;
      },
      message: "Please select at least one day",
    },
    required: true,
  },
  blockSchedule: {
    type: [
      {
        weekNumber: { type: Number, required: true },
        weekStartDate: {
          type: Date,
          required: true,
        },
        weeklySchedule: [
          {
            dailySchedule: [
              {
                primExercises: {
                  type: [String],
                  required: true,
                  enum: [
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
                  ],
                  validate: {
                    validator: function (v) {
                      return v.length > 0;
                    },
                    message: "Please select at least one title for the day.",
                  },
                },
                customExercisesId: [
                  {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "CustomExercise",
                  },
                ],
                presetExercisesId: [
                  {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "PresetExercise",
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
    validate: {
      validator: function (blockSchedule) {
        if (!this.numberOfWeeks) {
          return true; // Let other validations handle missing numberOfWeeks
        }
        return blockSchedule.length === this.numberOfWeeks;
      },
      message:
        "The number of weekly schedules in 'blockSchedule' must match 'numberOfWeeks'.",
    },
  },
});

blockSchema.pre("validate", function (next) {
  if (this.blockSchedule && this.blockSchedule.length > 0 && this.days) {
    for (const week of this.blockSchedule) {
      if (week.weeklySchedule && week.weeklySchedule.length > 0) {
        for (const weeklyItem of week.weeklySchedule) {
          if (
            weeklyItem.dailySchedule &&
            weeklyItem.dailySchedule.length !== this.days.length
          ) {
            this.invalidate(
              "blockSchedule",
              `Each 'weeklySchedule' must have ${this.days.length} 'dailySchedule' items, matching the number of selected 'days'.`,
              weeklyItem
            );
            return next();
          }
        }
      }
    }
  }

  next();
});

const Block = mongoose.model("Block", blockSchema);

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

const dailyScheduleSchema = Joi.object({
  primExercises: Joi.array()
    .items(Joi.string().valid(...primExercisesEnum))
    .min(1)
    .required()
    .messages({
      "array.min": "Please select at least one title for the day.",
      "any.required": "Primary exercises are required.",
      "string.valid":
        "{{#label}} must be one of the allowed primary exercises.",
    }),
  customExercisesId: Joi.array()
    .items(Joi.string().hex().length(24))
    .default([]),
  presetExercisesId: Joi.array()
    .items(Joi.string().hex().length(24))
    .default([]),
});

const weeklyScheduleItemSchema = Joi.object({
  dailySchedule: Joi.array().items(dailyScheduleSchema).required().messages({
    "array.base": "Daily schedule must be an array.",
    "any.required": "Daily schedule is required.",
  }),
});

const blockScheduleWeekSchema = Joi.object({
  weekNumber: Joi.number().integer().min(1).required(),
  weekStartDate: Joi.date().iso().required(), 
  weeklySchedule: Joi.array()
    .items(weeklyScheduleItemSchema)
    .length(1)
    .required() 
    .messages({
      "array.length": "Each week must contain exactly one weekly schedule.",
      "any.required": "Weekly schedule is required for each week.",
    }),
});

export { Block };
