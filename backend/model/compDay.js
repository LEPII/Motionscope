import Joi from "joi";
import mongoose from "mongoose";

const attemptsSchema = new mongoose.Schema({
  set: Number,
  reps: Number,
  weight: Number,
  actuallyAttempted: Boolean,
  record: Boolean,
});

const liftAttemptsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: ["Squat", "Bench", "Deadlift"],
    unique: true,
  },
  warmUps: [{ set: Number, reps: Number, weight: Number }],
  attempts: {
    first: attemptsSchema,
    second: [attemptsSchema],
    third: [attemptsSchema],
  },
});

const compDaySchema = new mongoose.Schema({
  coach: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  athlete: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  competitionName: { type: String, required: true },
  date: { type: Date, required: true },
  weightClass: {
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
  },
  lifts: [liftAttemptsSchema],
});

const CompDay = mongoose.model("Competition Day", compDaySchema);

function validateAttempt(attempt) {
  const schema = Joi.object({
    set: Joi.number().required(),
    reps: Joi.number().required(),
    weight: Joi.number().required(),
    actuallyAttempted: Joi.boolean().required(),
    record: Joi.boolean().required(),
  });
  return schema.validate(attempt);
}

function validateLiftAttempts(liftAttempts) {
  const schema = Joi.object({
    name: Joi.string().valid("Squat", "Bench", "Deadlift").required(),
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
      first: validateAttempt(Joi.any()).schema.required(),
      second: Joi.array().items(validateAttempt(Joi.any()).schema).required(),
      third: Joi.array().items(validateAttempt(Joi.any()).schema).required(),
    }).required(),
  });
  return schema.validate(liftAttempts);
}

function validateCompDay(compDay) {
  const schema = Joi.object({
    coach: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required(),
    athlete: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required(),
    competitionName: Joi.string().required(),
    date: Joi.date().required(),
    weightClass: Joi.string()
      .valid(
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
        "140+kg"
      )
      .required(),
    lifts: Joi.array().items(validateLiftAttempts(Joi.any()).schema).required(),
  });
  return schema.validate(compDay);
}

export { CompDay, validateCompDay };
