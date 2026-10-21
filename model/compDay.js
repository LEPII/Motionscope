import mongoose from "mongoose";
import { weightClassEnum, liftNameEnum } from "../constants/competition.js";

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
    enum: liftNameEnum,
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
    enum: weightClassEnum,
  },
  lifts: [liftAttemptsSchema],
});

const CompDay = mongoose.model("Competition Day", compDaySchema);

export { CompDay };
