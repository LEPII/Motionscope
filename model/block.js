import mongoose from "mongoose";
import {
  primExercisesEnum,
  dayEnum,
  setTypeEnum,
  setCreatedByEnum,
} from "../constants/block.js";

const setSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: setTypeEnum,
    required: true,
  },
  createdBy: {
    type: String,
    enum: setCreatedByEnum,
    required: true,
  },

  // Coach's fields
  repsMin: { type: Number, min: 0, max: 30 },
  reps: { type: Number, min: 0, max: 30 },
  prescribedLoadMin: { type: Number, min: 0, max: 100 },
  prescribedLoad: { type: Number, min: 0, max: 100 },
  prescribedRPEMin: { type: Number, min: 0, max: 10 },
  prescribedRPE: { type: Number, min: 0, max: 10 },
  // - Derived absolute target loads (in lbs, from PR)
  targetLoadMin: { type: Number, min: 0 },
  targetLoad: { type: Number, min: 0 },
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
  isArchived: {
  type: Boolean,
  default: false,
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
}, { timestamps: true });

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
    err.status = 409;
    return next(err);
  }

  next();
});

const Block = mongoose.model("Block", blockSchema);

export { Block, weeklyScheduleSchema };
