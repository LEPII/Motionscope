import Joi from "./common.js";
import { dayEnum } from "../constants/block.js";
import { weightClassEnum } from "../constants/competition.js";
import {
  genderEnum,
  preferredMetricEnum,
  rpeTrainingFamiliarityEnum,
  deadliftStanceEnum,
} from "../constants/questionnaire.js";

const validateQuestions = Joi.object({
  birthday: Joi.date()
    .required()
    .max("now"),
  gender: Joi.string().valid(...genderEnum).required(),
  preferredMetric: Joi.string().valid(...preferredMetricEnum).required(),
  height: Joi.number().required(),
  currentBodyWeight: Joi.number().min(10).max(500).required(),
  desiredWeightClass: Joi.string()
    .valid(...weightClassEnum)
    .required(),
  gymExperienceYears: Joi.number().min(0).max(100).required(),
  powerliftingExperienceYears: Joi.number().min(0).max(100).required(),
  competedInMeet: Joi.boolean().required(),
  bestSquatTraining: Joi.number().default(null).min(1).max(5000).required(),
  bestBenchTraining: Joi.number().default(null).min(1).max(5000).required(),
  bestDeadliftTraining: Joi.number()
    .default(null)
    .min(1)
    .max(5000)
    .required(),
  bestSquatCompetition: Joi.number().default(null).min(1).max(5000),
  bestBenchCompetition: Joi.number().default(null).min(1).max(5000),
  bestDeadliftCompetition: Joi.number().default(null).min(1).max(5000),
  nextPlannedCompetitionDate: Joi.date()
    .allow(null)
    .default(null)
    .min("now"),
  trainingHistory: Joi.string().max(2000).required(),
  currentTrainingProgram: Joi.string().max(2000).required(),
  rpeTrainingFamiliarity: Joi.string()
    .valid(...rpeTrainingFamiliarityEnum)
    .required(),
  deadliftStance: Joi.string()
    .valid(...deadliftStanceEnum)
    .required(),
  liftingGoals: Joi.string().max(2000).required(),
  availableTrainingDays: Joi.array()
    .items(
      Joi.string().valid(...dayEnum)
    )
    .required(),
  availableEquipment: Joi.string().max(2000).required(),
  injuries: Joi.string().max(2000).optional(),
  startDate: Joi.date()
    .required()
    .min("now"),
  questionsOrConcerns: Joi.string().max(2000).optional(),
  submitted: Joi.boolean().required(),
});

const validatePatchedQuestions = Joi.object({
  _id: Joi.objectId().required(),
  birthday: Joi.date()
    .optional()
    .max("now"),
  gender: Joi.string().valid(...genderEnum).optional(),
  preferredMetric: Joi.string().valid(...preferredMetricEnum).optional(),
  height: Joi.number().optional(),
  currentBodyWeight: Joi.number().min(10).max(500).optional(),
  desiredWeightClass: Joi.string()
    .valid(...weightClassEnum)
    .optional(),
  gymExperienceYears: Joi.number().min(0).max(100).optional(),
  powerliftingExperienceYears: Joi.number().min(0).max(100).optional(),
  competedInMeet: Joi.boolean().optional(),
  bestSquatTraining: Joi.number().default(null).min(1).max(2000).optional(),
  bestBenchTraining: Joi.number().default(null).min(1).max(2000).optional(),
  bestDeadliftTraining: Joi.number()
    .default(null)
    .min(1)
    .max(2000)
    .optional(),
  bestSquatCompetition: Joi.number().default(null).min(1).max(2000),
  bestBenchCompetition: Joi.number().default(null).min(1).max(2000),
  bestDeadliftCompetition: Joi.number().default(null).min(1).max(2000),
  nextPlannedCompetitionDate: Joi.date()
    .allow(null)
    .default(null)
    .min("now"),
  trainingHistory: Joi.string().max(2000).optional(),
  currentTrainingProgram: Joi.string().max(2000).optional(),
  rpeTrainingFamiliarity: Joi.string()
    .valid(...rpeTrainingFamiliarityEnum)
    .optional(),
  deadliftStance: Joi.string()
    .valid(...deadliftStanceEnum)
    .optional(),
  liftingGoals: Joi.string().max(2000).optional(),
  availableTrainingDays: Joi.array()
    .items(
      Joi.string().valid(...dayEnum)
    )
    .optional(),
  availableEquipment: Joi.string().max(2000).optional(),
  injuries: Joi.string().max(2000).optional(),
  startDate: Joi.date()
    .optional()
    .min("now"),
  questionsOrConcerns: Joi.string().max(2000).optional(),
  submitted: Joi.boolean().optional(),
});

export { validateQuestions, validatePatchedQuestions };
