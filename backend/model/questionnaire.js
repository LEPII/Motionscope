import Joi from "joi";
import mongoose from "mongoose";

const questionnaireSchema = new mongoose.Schema({
  birthday: {
    type: Date,
    required: true,
    validate: {
      validator: function (value) {
        return value <= Date.now();
      },
      message: "Birthday must be in the past.",
    },
  },
  gender: {
    type: String,
    enum: ["Male", "Female"],
    required: true,
  },
  preferredMetric: {
    type: String,
    enum: ["Kilograms", "Pounds"],
    required: true,
  },
  height: {
    type: Number,
    required: true,
  },
  currentBodyWeight: {
    type: Number,
    min: 10,
    max: 500,
    required: true,
  },
  desiredWeightClass: {
    type: String,
    enum: [
      "44kg",
      "48kg",
      "52kg",
      "56kg",
      "60kg",
      "67.5kg",
      "75kg",
      "82kg",
      "90kg",
      "100kg",
      "110kg",
      "125kg",
      "140kg",
      "140+kg",
    ],
    required: true,
  },
  gymExperienceYears: {
    type: Number,
    min: 0,
    max: 100,
    required: true,
  },
  powerliftingExperienceYears: {
    type: Number,
    min: 0,
    max: 100,
    required: true,
  },
  competedInMeet: {
    type: Boolean,
    required: true,
  },
  bestSquatTraining: {
    type: Number,
    default: null,
    min: 1,
    max: 5000,
    required: true,
  },
  bestBenchTraining: {
    type: Number,
    default: null,
    min: 1,
    max: 5000,
    required: true,
  },
  bestDeadliftTraining: {
    type: Number,
    default: null,
    min: 1,
    max: 5000,
    required: true,
  },
  bestSquatCompetition: {
    type: Number,
    default: null,
    min: 1,
    max: 2000,
  },
  bestBenchCompetition: {
    type: Number,
    default: null,
    min: 1,
    max: 2000,
  },
  bestDeadliftCompetition: {
    type: Number,
    default: null,
    min: 1,
    max: 2000,
  },
  nextPlannedCompetitionDate: {
    type: Date,
    default: null,
    validate: {
      validator: function (value) {
        return value >= Date.now();
      },
      message: "Next planned competition date must be today or in the future.",
    },
  },
  trainingHistory: {
    type: String,
    maxLength: 2000,
    required: true,
  },
  currentTrainingProgram: {
    type: String,
    maxLength: 2000,
    required: true,
  },
  rpeTrainingFamiliarity: {
    type: String,
    enum: ["Not Familiar", "Somewhat Familiar", "Proficient"],
    required: true,
  },
  deadliftStance: {
    type: String,
    enum: ["Conventional", "Sumo", "No Preference"],
    required: true,
  },
  liftingGoals: {
    type: String,
    maxLength: 2000,
    required: true,
  },
  availableTrainingDays: {
    type: [String],
    enum: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    required: true,
  },
  availableEquipment: {
    type: String,
    maxLength: 2000,
    required: true,
  },
  injuries: {
    type: String,
    maxLength: 2000,
    required: false,
  },
  startDate: {
    type: Date,
    required: true,
    validate: {
      validator: function (value) {
        return value >= Date.now();
      },
      message: "Start date must be today or in the future.",
    },
  },
  questionsOrConcerns: {
    type: String,
    maxLength: 2000,
    required: false,
  },
  submitted: {
    type: Boolean,
    default: false,
  },
});

const Questionnaire = mongoose.model("Questionnaire", questionnaireSchema);

function validateQuestions(questions) {
  const schema = {
    birthday: Joi.date()
      .required()
      .allow((value) => value <= Date.now(), "Birthday must be in the past"),
    gender: Joi.string().valid("Male", "Female").required(),
    preferredMetric: Joi.string().valid("Kilograms", "Pounds").required(),
    height: Joi.number().required(),
    currentBodyWeight: Joi.number().min(10).max(500).required(),
    desiredWeightClass: Joi.string()
      .valid("59kg", "66kg", "74kg", "83kg", "93kg", "105kg", "120kg", "120kg+")
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
      .default(null)
      .allow(
        (value) => value >= Date.now(),
        "Next planned competition date must be today or in the future."
      ),
    trainingHistory: Joi.string().max(2000).required(),
    currentTrainingProgram: Joi.string().max(2000).required(),
    rpeTrainingFamiliarity: Joi.string()
      .valid("Not Familiar", "Somewhat Familiar", "Proficient")
      .required(),
    deadliftStance: Joi.string()
      .valid("Conventional", "Sumo", "No Preference")
      .required(),
    liftingGoals: Joi.string().max(2000).required(),
    availableTrainingDays: Joi.array()
      .items(
        Joi.string().valid(
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday"
        )
      )
      .required(),
    availableEquipment: Joi.string().max(2000).required(),
    injuries: Joi.string().max(2000).optional(),
    startDate: Joi.date()
      .required()
      .allow(
        (value) => value >= Date.now(),
        "Start date must be today or in the future."
      ),
    questionsOrConcerns: Joi.string().max(2000).optional(),
    submitted: Joi.boolean().required(),
  };

  return Joi.validate(questions, schema);
}

function validatePatchedQuestions(patchedQuestions) {
  const patchedSchema = {
    _id: Joi.objectId().required(),
    birthday: Joi.date()
      .optional()
      .allow((value) => value <= Date.now(), "Birthday must be in the past"),
    gender: Joi.string().valid("Male", "Female").optional(),
    preferredMetric: Joi.string().valid("kilograms", "pounds").optional(),
    height: Joi.number().optional(),
    currentBodyWeight: Joi.number().min(10).max(500).optional(),
    desiredWeightClass: Joi.string()
      .valid("59kg", "66kg", "74kg", "83kg", "93kg", "105kg", "120kg", "120kg+")
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
      .default(null)
      .allow(
        (value) => value >= Date.now(),
        "Next planned competition date must be today or in the future."
      ),
    trainingHistory: Joi.string().max(2000).optional(),
    currentTrainingProgram: Joi.string().max(2000).optional(),
    rpeTrainingFamiliarity: Joi.string()
      .valid("Not Familiar", "Somewhat Familiar", "Proficient")
      .optional(),
    deadliftStance: Joi.string()
      .valid("Conventional", "Sumo", "No Preference")
      .optional(),
    liftingGoals: Joi.string().max(2000).optional(),
    availableTrainingDays: Joi.array()
      .items(
        Joi.string().valid(
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday"
        )
      )
      .optional(),
    availableEquipment: Joi.string().max(2000).optional(),
    injuries: Joi.string().max(2000).optional(),
    startDate: Joi.date()
      .optional()
      .allow(
        (value) => value >= Date.now(),
        "Start date must be today or in the future."
      ),
    questionsOrConcerns: Joi.string().max(2000).optional(),
    submitted: Joi.boolean().optional(),
  };
  return Joi.validate(patchedQuestions, patchedSchema);
}

export {
  Questionnaire,
  validateQuestions as validate,
  validatePatchedQuestions as patchedValidate,
};
