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
});

const Questionnaire = mongoose.model("Questionnaire", questionnaireSchema);

function validateQuestions(questions) {
  const schema = {
    // firstName: Joi.string()
    birthday: Joi.date(),
    gender: Joi.string(),
    
  };
  return Joi.validate(questions, schema);
}

exports.Questionnaire = Questionnaire;
exports.validate = validateQuestions;
