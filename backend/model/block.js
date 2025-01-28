import Joi from "joi";
import mongoose from "mongoose";
import JoiObjectId from "joi-objectid";
import {customExerciseSchema} from "./customExercise.js";
import { presetExerciseSchema } from "./presetExercise.js";

Joi.objectId = JoiObjectId(Joi);

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
          customExercises: [customExerciseSchema],
          presetExercisesId: [presetExerciseSchema],
        },
      ],
    },
  ],
});

const Block = mongoose.model("Block", blockSchema);

const validateBlock = (blockInfo) => {
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
                customExercises: Joi.array().items(ObjectId()).optional(),
                presetExercisesId: Joi.array().items(ObjectId()).optional(),
                customExercises: Joi.when("presetExercisesId", {
                  is: Joi.array().length(0),
                  then: Joi.array().items(ObjectId()).min(1),
                }),
                presetExercisesId: Joi.when("customExercises", {
                  is: Joi.array().length(0),
                  then: Joi.array().items(ObjectId()).min(1),
                }),
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
};

export { Block, validateBlock };
