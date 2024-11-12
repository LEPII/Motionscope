const mongoose = require("mongoose");
const Joi = require("joi");

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
    enum: ["kilograms", "pounds"],
    required: true,
  },
  height: {
    type: Number,
    required: true,
  },
  currentBodyWeight: {
    type: Number,
    required: true,
    min: 10,
    max: 500,
  },
  desiredWeightClass: {
    type: String,
    enum: ["59kg", "66kg", "74kg", "83kg", "93kg", "105kg", "120kg", "120kg+"],
    required: true,
  },
  gymExperienceYears: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  powerliftingExperienceYears: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  competedInMeet: {
    type: Boolean,
    required: true,
  },
  bestSquatTraining: {
    type: Number,
    required: true,
    default: null,
    min: 1,
    max: 2000,
  },
  bestBenchTraining: {
    type: Number,
    required: true,
    default: null,
    min: 1,
    max: 2000,
  },
  bestDeadliftTraining: {
    type: Number,
    required: true,
    default: null,
    min: 1,
    max: 2000,
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
        return value >= Date.now(); // Ensures that the date is not in the past
      },
      message: "Next planned competition date must be today or in the future.",
    },
  },
  trainingHistory: {
    type: String,
    maxlength: 2000,
    required: true,
  },
  currentTrainingProgram: {
    type: String,
    maxlength: 2000,
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
    maxlength: 2000,
    required: true,
  },
  weeklyTrainingDays: {
    type: Number,
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
    maxlength: 2000,
    required: true,
  },
  injuries: {
    type: String,
    maxlength: 2000,
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
    maxlength: 2000,
    required: false,
  },
  submitted: {
    type: Boolean,
    default: false,
  },
});

const Questionnaire = mongoose.model("Questionnaire", questionnaireSchema);

const optionalForPatch = (value, helper) => {
  if (helper.context.method === "PATCH" && value === undefined) {
    return value;
  }
  return value;
};

function validateQuestions(questions) {
  const schema = {
    birthday: Joi.date()
      .required()
      .allow((value) => value <= Date.now(), "Birthday must be in the past"),
    gender: Joi.string().valid("Male", "Female").required(),
    preferredMetric: Joi.string().valid("kilograms", "pounds").required(),
    height: Joi.number().required(),
    currentBodyWeight: Joi.number().min(10).max(500).required(),
    desiredWeightClass: Joi.string()
      .valid("59kg", "66kg", "74kg", "83kg", "93kg", "105kg", "120kg", "120kg+")
      .required(),
    gymExperienceYears: Joi.number().min(0).max(100).required(),
    powerliftingExperienceYears: Joi.number().min(0).max(100).required(),
    competedInMeet: Joi.boolean().required(),
    bestSquatTraining: Joi.number().default(null).min(1).max(2000).required(),
    bestBenchTraining: Joi.number().default(null).min(1).max(2000).required(),
    bestDeadliftTraining: Joi.number()
      .default(null)
      .min(1)
      .max(2000)
      .required(),
    bestSquatCompetition: Joi.number().default(null).min(1).max(2000),
    bestBenchCompetition: Joi.number().default(null).min(1).max(2000),
    bestDeadliftCompetition: Joi.number().default(null).min(1).max(2000),
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
    weeklyTrainingDays: Joi.number().required(),
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
    weeklyTrainingDays: Joi.number().optional(),
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

exports.Questionnaire = Questionnaire;
exports.validate = validateQuestions;
exports.patchedValidate = validatePatchedQuestions;
