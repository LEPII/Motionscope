import mongoose from "mongoose";
import { weeklyScheduleSchema, dayEnum } from "./block";

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
