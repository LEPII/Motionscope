import Joi from "./common.js";

const validateProgram = Joi.object({
  coachId: Joi.objectId()
    .required()
    .messages({
      "string.pattern.name": "Coach must be a valid ObjectId",
      "any.required": "Coach is required",
    }),
  athleteId: Joi.objectId()
    .required()
    .messages({
      "string.pattern.name": "Athlete must be a valid ObjectId",
      "any.required": "Athlete is required",
    }),
  blocks: Joi.array()
    .items(Joi.objectId())
    .optional()
    .messages({
      "string.pattern.name": "Each block in the array must be a valid ObjectId",
    }),
  compDays: Joi.array()
    .items(Joi.objectId())
    .optional()
    .messages({
      "string.pattern.name":
        "Each compDay in the array must be a valid ObjectId",
    }),
  isArchived: Joi.boolean().optional(),
});

export { validateProgram };
