import { CompDay, validateCompDay } from "../model/compDay.js";
import { Program } from "../model/program.js";

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
  const { error, value: compDayData } = validateCompDay(req.body);
  if (error)
    return res
      .status(400)
      .json({ message: "Invalid CompDay data", error: error.details });

  const { programId } = req.body;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const program = await Program.findById(programId).session(session);
    if (!program) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Program not found" });
    }

    const newCompDay = new CompDay(compDayData);
    const savedCompDay = await newCompDay.save({ session });

    program.compDays.push(savedCompDay._id);
    await program.save({ session });

    res.status(201).json({
      message: "CompDay created and added to Program",
      compDay: savedCompDay,
    });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession;
  }
};

const updateCompDay = async (req, res) => {
  const { error } = validateCompDay(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const updatedCompDay = await CompDay.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!updatedCompDay) {
    return res.status(404).send("Competition day not found.");
  }

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

export {
  getSingleCompDayForAthlete,
  getAllCompDaysForAthlete,
  postCompDay,
  updateCompDay,
  deleteCompDay,
  getAthleteCompDay,
  getAllAthleteCompDays,
};
