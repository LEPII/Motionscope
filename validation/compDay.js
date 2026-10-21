import Joi, { toUpdateSchema } from "./common.js";
import { weightClassEnum, liftNameEnum } from "../constants/competition.js";

const attemptSchema = Joi.object({
  set: Joi.number().required(),
  reps: Joi.number().required(),
  weight: Joi.number().required(),
  actuallyAttempted: Joi.boolean().required(),
  record: Joi.boolean().required(),
});

const liftAttemptsSchema = Joi.object({
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
    first: attemptSchema.required(),
    second: Joi.array().items(attemptSchema).required(),
    third: Joi.array().items(attemptSchema).required(),
  }).required(),
});

const compDaySchema = Joi.object({
  coach: Joi.objectId()
    .required(),
  athlete: Joi.objectId()
    .required(),
  competitionName: Joi.string().required(),
  date: Joi.date().required(),
  weightClass: Joi.string()
    .valid(...weightClassEnum)
    .required(),
  lifts: Joi.array().items(liftAttemptsSchema).required(),
});

// PATCH: same fields as compDaySchema, but every top-level field is optional
const compDayUpdateSchema = toUpdateSchema(compDaySchema);

// Athletes may only toggle actuallyAttempted on an attempt
const attemptUpdateSchema = Joi.object({
  actuallyAttempted: Joi.boolean().required(),
});

export {
  attemptSchema,
  liftAttemptsSchema,
  compDaySchema,
  compDayUpdateSchema,
  attemptUpdateSchema,
};
