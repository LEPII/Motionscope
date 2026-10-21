import mongoose from "mongoose";
import { dayEnum } from "../constants/block.js";
import { weightClassEnum } from "../constants/competition.js";
import {
  genderEnum,
  preferredMetricEnum,
  rpeTrainingFamiliarityEnum,
  deadliftStanceEnum,
} from "../constants/questionnaire.js";

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
    enum: genderEnum,
    required: true,
  },
  preferredMetric: {
    type: String,
    enum: preferredMetricEnum,
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
    enum: weightClassEnum,
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
    enum: rpeTrainingFamiliarityEnum,
    required: true,
  },
  deadliftStance: {
    type: String,
    enum: deadliftStanceEnum,
    required: true,
  },
  liftingGoals: {
    type: String,
    maxLength: 2000,
    required: true,
  },
  availableTrainingDays: {
    type: [String],
    enum: dayEnum,
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

export { Questionnaire };
