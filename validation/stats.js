import Joi from "./common.js";

const validateAthleteStats = Joi.object({
  user: Joi.objectId().required(),
  oneRepMaxes: Joi.object({
    squat: Joi.number().min(0).max(100000).optional(),
    bench: Joi.number().min(0).max(100000).optional(),
    deadlift: Joi.number().min(0).max(100000).optional(),
  })
    .required()
    .messages({
      "any.required": "oneRepMaxes object is required",
    }),
});

const validateAthleteStatsUpdate = Joi.object({
  oneRepMaxes: Joi.object({
    squat: Joi.number().min(0).max(100000).optional(),
    bench: Joi.number().min(0).max(100000).optional(),
    deadlift: Joi.number().min(0).max(100000).optional(),
  }).optional(),
}).min(1);

export { validateAthleteStats, validateAthleteStatsUpdate };
