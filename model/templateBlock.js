import mongoose from "mongoose";
import { weeklyScheduleSchema } from "./block.js";
import { dayEnum } from "../constants/block.js";

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

export { SavedBlockTemplate };
