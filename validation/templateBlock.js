import Joi from "./common.js";
import { dayEnum } from "../constants/block.js";
import { weeklyScheduleCoachSchema } from "./block.js";

// Templates store the same weekly schedule shape as blocks (model/templateBlock.js reuses weeklyScheduleSchema)
const blockTemplateSchema = Joi.object({
  coach: Joi.objectId().required(),
  templateName: Joi.string().min(1).max(50).required(),
  numberOfWeeks: Joi.number().integer().min(1).max(12).required(),
  days: Joi.array()
    .items(Joi.string().valid(...dayEnum))
    .min(1)
    .required(),
  blockSchedule: Joi.array().items(weeklyScheduleCoachSchema).optional(),
});

// Any field left out falls back to the template's value
const createBlockFromTemplateSchema = Joi.object({
  athlete: Joi.objectId().required(),
  blockName: Joi.string().min(1).max(50).optional(),
  numberOfWeeks: Joi.number().integer().min(1).max(12).optional(),
  days: Joi.array()
    .items(Joi.string().valid(...dayEnum))
    .min(1)
    .optional(),
  blockSchedule: Joi.array().items(weeklyScheduleCoachSchema).optional(),
  blockStartDate: Joi.date().iso().required(),
  blockEndDate: Joi.date().iso().required(),
});

export { blockTemplateSchema, createBlockFromTemplateSchema };
