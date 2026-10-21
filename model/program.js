import mongoose from "mongoose";

const programSchema = new mongoose.Schema(
  {
    coachId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    athleteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    blocks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Block" }],
    compDays: [{ type: mongoose.Schema.Types.ObjectId, ref: "CompDay" }],
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, 
  }
);

const Program = mongoose.model("Program", programSchema);

export { Program };
