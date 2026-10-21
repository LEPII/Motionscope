import mongoose from "mongoose";

const athleteStatsSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true },
  oneRepMaxes: {
    squat: { type: Number },
    bench: { type: Number },
    deadlift: { type: Number },
  },
});

const AthleteStats = mongoose.model("AthleteStats", athleteStatsSchema);

export { AthleteStats };
