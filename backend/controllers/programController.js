import { Program, validateProgram } from "../model/program.js";
import { User } from "../model/user.js";

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

export { postProgram };
