import { Program, validateProgram } from "../model/program.js";
import { User } from "../model/user.js";
import { Block } from "../model/block.js";
import { CompDay } from "../model/compDay.js";

const sortTrainingItems = (items) => {
  return items.sort(
    (a, b) => new Date(b.startDate || b.date) - new Date(a.startDate || a.date)
  );
};

const getRosterList = async (req, res) => {
  const coachId = req.user._id;

  const coach = await User.findById(coachId).populate({
    path: "athletes",
    select: "username firstName lastName",
  });

  if (!coach) {
    return res.status(403).json({ message: "Coach not found." });
  }

  const roster = coach.athletes.map((athlete) => ({
    id: athlete._id,
    username: athlete.username,
    firstName: athlete.firstName,
    lastName: athlete.lastName,
  }));

  res.status(200).json(roster);
};

const getCurrentProgram = async (req, res) => {
  const coachId = req.user._id;
  const { athleteId } = req.params;

  const program = await Program.findOne({
    coachId,
    athleteId,
    isArchived: false,
  })
    .populate("blocks", "blockName blockStartDate")
    .populate("compDays", "name date");

  if (!program) {
    return res.status(200).json({
      message: "No program found for this athlete. Incentivize creation!",
      program: null,
      blocks: [],
      compDays: [],
    });
  }

  let allTrainingItems = [...program.blocks, ...program.compDays];
  allTrainingItems = sortTrainingItems(allTrainingItems);

  const currentTrainingItem =
    allTrainingItems.length > 0 ? allTrainingItems[0] : null;

  res.status(200).json({
    message: "Program retrieved successfully",
    programId: program._id,
    blocks: program.blocks,
    compDays: program.compDays,
    allTrainingItems: allTrainingItems,
    currentTrainingItem: currentTrainingItem,
  });
};

const postProgram = async (req, res) => {
  const { error, value: programData } = validateProgram.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ message: "Invalid program data.", error: error.details });
  }

  const coachId = req.user._id;

  const { athleteId } = programData;

  if (req.user.role !== "coach") {
    return res
      .status(403)
      .json({ message: "Access denied. Only coaches can create programs." });
  }

  const athleteUser = await User.findById(athleteId);
  if (!athleteUser) {
    return res.status(404).json({ message: "Athlete not found." });
  }

  // doing an explicit search for the search here (even if we're already getting the coach from req.user) to see if athlete is in the roster

  const coachUser = await User.findById(coachId);
  if (!coachUser || !coachUser.athletes.includes(athleteId)) {
    return res.status(400).json({
      message: "Athlete is not on the coach's roster or coach not found.",
    });
  }

  const existingProgram = await Program.findOne({
    coachId: coachId,
    athleteId: athleteId,
  });
  if (existingProgram) {
    return res.status(409).json({
      message: "A program already exists for this coach and athlete.",
    });
  }

  const newProgram = new Program({
    coachId: coachId,
    athleteId: athleteId,
    blocks: [],
    compDays: [],
  });

  const savedProgram = await newProgram.save();

  res
    .status(201)
    .json({ message: "Program created successfully", program: savedProgram });
};

const deleteProgram = async (req, res) => {
  const coachId = req.user._id;
  const { id } = req.params;

  const program = await Program.findOne({ _id: id, coachId });

  await Promise.all([
    Block.deleteMany({ _id: { $in: program.blocks } }),
    CompDay.deleteMany({ _id: { $in: program.compDays } }),
  ]);

  await program.deleteOne();

  res.status(200).json({
    message: "Program and associated training data deleted successfully.",
  });
};

const toggleProgramArchive = async (req, res) => {
  const coachId = req.user._id;
  const { id } = req.params;
  const { archive } = req.body;

  if (typeof archive !== "boolean") {
    return res
      .status(400)
      .json({ message: 'Invalid request: "archive" must be a boolean.' });
  }

  const program = await Program.findOneAndUpdate(
    {
      _id: id,
      coachId,
    },
    { $set: { isArchived: archive } },
    {
      new: true,
    }
  );

  if (!program) {
    return res.status(400).json({ message: "Program not found" });
  }

  const statusMessage = archive ? "archived" : "unarchived";
  res
    .status(200)
    .json({ message: `Program ${statusMessage} successfully`, program });
};

const getCurrentProgramForAthlete = async (req, res) => {
  const athleteId = req.user._id;

  const program = await Program.findOne({ athleteId, isArchived: false })
    .populate("blocks", "blockName blockStartDate")
    .populate("compDays", "name date");

  if (!program) {
    return res.status(200).json({
      message:
        "No program assigned to you yet. Please wait for your coach to create one.",
      program: null,
      currentTrainingItem: null,
      allTrainingItems: [],
    });
  }

  let allTrainingItems = [...program.blocks, ...program.compDays];
  allTrainingItems = sortTrainingItems(allTrainingItems);

  const currentTrainingItem =
    allTrainingItems.length > 0 ? allTrainingItems[0] : null;

  res.status(200).json({
    message: "Program retrieved successfully",
    programId: program._id,
    blocks: program.blocks,
    compDays: program.compDays,
    allTrainingItems: allTrainingItems,
    currentTrainingItem: currentTrainingItem,
  });
};

export {
  postProgram,
  getRosterList,
  getCurrentProgram,
  deleteProgram,
  toggleProgramArchive,
  getCurrentProgramForAthlete,
};