import Joi from "joi";
import mongoose from "mongoose";

const programSchema = new mongoose.Schema(
  {
    coachId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    athleteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    blocks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Block" }],
    compDays: [{ type: mongoose.Schema.Types.ObjectId, ref: "CompDay" }],
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, 
  }
);

const Program = mongoose.model("Program", programSchema);

const validateProgram = Joi.object({
  coachId: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Coach must be a valid ObjectId",
      "any.required": "Coach is required",
    }),
  athleteId: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Athlete must be a valid ObjectId",
      "any.required": "Athlete is required",
    }),
  blocks: Joi.array()
    .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
    .optional()
    .messages({
      "string.pattern.base": "Each block in the array must be a valid ObjectId",
    }),
  compDays: Joi.array()
    .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
    .optional()
    .messages({
      "string.pattern.base":
        "Each compDay in the array must be a valid ObjectId",
    }),
  isArchived: Joi.boolean().optional(),
});

export { Program, validateProgram };