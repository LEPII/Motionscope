import Joi, { toUpdateSchema } from "./common.js";
import { weightClassEnum, liftNameEnum } from "../constants/competition.js";

const validateAttempt = Joi.object({
  set: Joi.number().required(),
  reps: Joi.number().required(),
  weight: Joi.number().required(),
  actuallyAttempted: Joi.boolean().required(),
  record: Joi.boolean().required(),
});

const validateLiftAttempts = Joi.object({
  name: Joi.string()
    .valid(...liftNameEnum)
    .required(),
  warmUps: Joi.array()
    .items(
      Joi.object({
        set: Joi.number().required(),
        reps: Joi.number().required(),
        weight: Joi.number().required(),
      })
    )
    .required(),
  attempts: Joi.object({
    first: validateAttempt.required(),
    second: Joi.array().items(validateAttempt).required(),
    third: Joi.array().items(validateAttempt).required(),
  }).required(),
});

const validateCompDay = Joi.object({
  coach: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required(),
  athlete: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required(),
  competitionName: Joi.string().required(),
  date: Joi.date().required(),
  weightClass: Joi.string()
    .valid(...weightClassEnum)
    .required(),
  lifts: Joi.array().items(validateLiftAttempts).required(),
});

// PATCH: same fields as validateCompDay, but every top-level field is optional
const validateCompDayUpdate = toUpdateSchema(validateCompDay);

// Athletes may only toggle actuallyAttempted on an attempt
const validateAttemptUpdate = Joi.object({
  actuallyAttempted: Joi.boolean().required(),
});

export {
  validateAttempt,
  validateLiftAttempts,
  validateCompDay,
  validateCompDayUpdate,
  validateAttemptUpdate,
};
