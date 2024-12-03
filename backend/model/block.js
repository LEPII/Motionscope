const Joi = require("joi");
const mongoose = require("mongoose");

const blockSchema = new mongoose.Schema({
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
    unique: true,
    validate: {
      validator: function (value) {
        const today = new Date();
        return value >= today;
      },
      message: "Block start date must be today or in the future.",
    },
    validate: {
      validator: function (value) {
        const dayOfWeek = value.getDay();
        return dayOfWeek === 0;
      },
      message: "Block start date must be a Sunday.",
    },
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
  weeklySchedule: [
    {
      weekStartDate: {
        type: Date,
        required: true,
        unique: true,
      },
      dailySchedule: [
        {
          primExercises: {
            type: [String],
            required: true,
            enum: [
              "Primary Squat",
              "Secondary Squat",
              "Volume Squat",
              "Primary Bench",
              "Secondary Bench",
              "Volume Bench",
              "Primary Deadlift",
              "Secondary Deadlift",
              "Volume Deadlift",
            ],
            validate: {
              validator: function (v) {
                return v.length > 0;
              },
              message: "Please select at least one title for the day.",
            },
          },
          exercises: [exerciseSchema],
          presetExercises: [presetExerciseSchema],
        },
      ],
    },
  ],
});

blockSchema.pre("validate", function (next) {
  // Validates if numberOfWeeks is the same as the amount of object in weeklySchedule. 
  if (this.numberOfWeeks !== this.weeklySchedule.length) {
    this.invalidate(
      "numberOfWeeks",
      "Number of weeks must match the length of weeks in weeklySchedule"
    );
  }

  // Validate if the number of items in the days array is the same as the amount of objects in the dailySchedule array. 
  this.weeklySchedule.forEach((week, index) => {
    if (this.days.length !== week.dailySchedule.length) {
      this.invalidate(
        `weeklySchedule.${index}.dailySchedule`,
        "Number of days in weeklySchedule must match the length of days selected"
      );
    }
  });
  next();
});

const Block = mongoose.model("Block", blockSchema);

function validateBlock(blockInfo) {
  const blockSchema = {
    blockName: Joi.string().min(1).max(50).required(),
    numberOfWeeks: Joi.number().min(1).max(12).required(),
    blockStartDate: Joi.date()
      .default(null)
      .required()
      .allow(
        (value) => value >= Date.now(),
        "Start date must be today or in the future."
      ),
    days: Joi.array().items(
      Joi.string().valid(
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
      )
    ),
    weeklySchedule: Joi.array()
      .items(
        Joi.object({
          weekStartDate: Joi.date(),
          dailySchedule: Joi.array()
            .items(
              Joi.object({
                primExercises: Joi.array().items(
                  Joi.string().valid(
                    "Primary Squat",
                    "Secondary Squat",
                    "Volume Squat",
                    "Primary Bench",
                    "Secondary Bench",
                    "Volume Bench",
                    "Primary Deadlift",
                    "Secondary Deadlift",
                    "Volume Deadlift"
                  )
                ),
                exercise: Joi.string().required(),
                presetExercise: Joi.string().required(),
              })
            )
            .min(1)
            .required(),
        })
      )
      .min(1)
      .required(),
  };
  return Joi.validate(blockInfo, blockSchema);
}

exports.Block = Block;
exports.validateBlock = validateBlock; 