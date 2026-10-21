import Joi from "./common.js";

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

export { validateProgram };
