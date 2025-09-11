import { CompDay, validateCompDay } from "../model/compDay.js";
import { Program } from "../model/program.js";
import mongoose from "mongoose";

// -- COACH'S ENDPOINTS --

const getSingleCompDayForAthlete = async (req, res) => {
  const { athleteId, compDayId } = req.params;

  const program = await Program.findOne({ athleteId });
  if (!program) {
    return res
      .status(404)
      .json({ message: "Program not found for this athlete" });
  }

  if (!program.compDays.includes(compDayId)) {
    return res
      .status(400)
      .json({ message: "CompDay does not belong to this athlete's program." });
  }

  const singleCompDay = await CompDay.findById(compDayId);

  if (!singleCompDay) {
    return res.status(404).json({ message: "CompDay not found" });
  }

  res
    .status(200)
    .json({ message: "CompDay retrieved successfully", singleCompDay });
};

const getAllCompDaysForAthlete = async (req, res) => {
  const { athleteId } = req.params;

  const program = await Program.findOne({ athleteId });
  if (!program) {
    return res
      .status(404)
      .json({ message: "Program not found for this athlete" });
  }

  const allCompDays = await CompDay.find({ _id: { $in: program.compDays } });
  res.status(200).json({
    message: "CompDays for athlete retrieved successfully",
    allCompDays,
  });
};

const postCompDay = async (req, res) => {
  const { error, value: compDayData } = validateCompDay.validate(req.body);
  if (error)
    return res
      .status(400)
      .json({ message: "Invalid CompDay data", error: error.details });

  const { programId } = req.body;
  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    const program = await Program.findById(programId).session(session);
    if (!program) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Program not found" });
    }

    const newCompDay = new CompDay(compDayData);
    const savedCompDay = await newCompDay.save({ session });

    program.compDays.push(savedCompDay._id);
    await program.save({ session });

    await session.commitTransaction();

    res.status(201).json({
      message: "CompDay created and added to Program",
      compDay: savedCompDay,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Transaction failed:", err);
    return res
      .status(500)
      .json({ message: "Something went wrong", error: err.message });
  } finally {
    session.endSession;
  }
};

const updateCoachCompDay = async (req, res) => {
  const { compDayId } = req.params;
  const updates = req.body;

  const { error: compDayError } = validateCompDay.validate(updates);
  if (compDayError)
    return res
      .status(400)
      .json({ message: "Invalid attempt data", error: compDayError.details });

  const compDay = await CompDay.findById(compDayId);
  if (!compDay) {
    return res.status(404).send("Competition day not found.");
  }

  // This prevents the coach from updating 'actuallyAttempted' within any attempt
  if (req.body.lifts) {
    for (let lift of req.body.lifts) {
      if (lift.attempts) {
        if (
          lift.attempts.first &&
          lift.attempts.first.actuallyAttempted !== undefined
        ) {
          return res
            .status(400)
            .send(
              "Coaches cannot update the 'actuallyAttempted' field of first attempt."
            );
        }
        if (lift.attempts.second) {
          for (let secondAttempt of lift.attempts.second) {
            if (secondAttempt.actuallyAttempted !== undefined) {
              return res
                .status(400)
                .send(
                  "Coaches cannot update the 'actuallyAttempted' field of second attempt."
                );
            }
          }
        }
        if (lift.attempts.third) {
          for (let thirdAttempt of lift.attempts.third) {
            if (thirdAttempt.actuallyAttempted !== undefined) {
              return res
                .status(400)
                .send(
                  "Coaches cannot update the 'actuallyAttempted' field of third attempt."
                );
            }
          }
        }
      }
    }
  }

  const updatedCompDay = await CompDay.findByIdAndUpdate(
    compDayId,
    { $set: updates },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).send(updatedCompDay);
};

const deleteCompDay = async (req, res) => {
  const deletedCompDay = await CompDay.findByIdAndDelete(req.params.id);

  if (!deletedCompDay) {
    return res.status(404).send("Competition day not found.");
  }

  res.status(204).send();
};

/// -- ATHLETE'S ENDPOINTS --

const getAthleteCompDay = async (req, res) => {
  const athleteId = req.user._id;
  const { compDayId } = req.params;

  const program = await Program.findOne({ athleteId });
  if (!program) {
    return res
      .status(404)
      .json({ message: "Program not found for this athlete" });
  }

  if (!program.compDays.includes(compDayId)) {
    return res
      .status(400)
      .json({ message: "CompDay does not belong to this athlete's program." });
  }

  const compDay = await CompDay.findById(compDayId);
  if (!compDay) {
    return res.status(404).json({ message: "CompDay not found" });
  }

  res
    .status(200)
    .json({ message: "Athlete CompDay retrieved successfully", compDay });
};

const getAllAthleteCompDays = async (req, res) => {
  const athleteId = req.user._id;

  const program = await Program.findOne({ athleteId });
  if (!program) {
    return res
      .status(404)
      .json({ message: "Program not found for this athlete" });
  }

  const compDays = await CompDay.find({ _id: { $in: program.compDays } });

  res
    .status(200)
    .json({ message: "Athlete CompDays retrieved successfully", compDays });
};

const updateAthleteCompDay = async (req, res) => {
  const { compDayId, liftName, attemptNumber, attemptIndex } = req.params;
  const { actuallyAttempted } = req.body;

  // Joi Validation
  const { error: attemptError } = attemptSchema.validate({ actuallyAttempted });
  if (attemptError) {
    return res
      .status(400)
      .json({ message: "Invalid attempt data", error: attemptError.details });
  }

  const compDay = await CompDay.findById(compDayId);
  if (!compDay) {
    return res.status(404).send("Competition Day not found");
  }

  // Find the lift
  const lift = compDay.lifts.find((l) => l.name === liftName);
  if (!lift) {
    return res.status(404).send(`Lift ${liftName} not found`);
  }

  let attemptArray;
  let index = parseInt(attemptIndex, 10);

  switch (attemptNumber.toLowerCase()) {
    case "first":
      attemptArray = [lift.attempts.first];
      index = 0;
      break;
    case "second":
      attemptArray = lift.attempts.second;
      break;
    case "third":
      attemptArray = lift.attempts.third;
      break;
    default:
      return res.status(400).send("Invalid attempt number");
  }

  if (!attemptArray || index < 0 || index >= attemptArray.length) {
    return res.status(404).send("Attempt not found");
  }

  attemptArray[index].actuallyAttempted = actuallyAttempted;

  await compDay.save();
  res.status(200).send(compDay);
};

export {
  getSingleCompDayForAthlete,
  getAllCompDaysForAthlete,
  postCompDay,
  updateCoachCompDay,
  deleteCompDay,
  getAthleteCompDay,
  getAllAthleteCompDays,
  updateAthleteCompDay,
};
