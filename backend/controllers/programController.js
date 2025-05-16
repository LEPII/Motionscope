import { Program, validateProgram } from "../model/program";
import { User } from "../model/user";

const PostProgram = async (req, res) => {
  const { error, value: programData } = validateProgram.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ message: "Invalid program data", error: error.details });
  }

  const { coachId, athleteId } = programData;

  const coachUser = await User.findById(coachId);
  if (!coachUser) {
    return res.status(404).json({ message: "Coach not found" });
  }
  if (coachUser.role !== "coach") {
    return res.status(403).json({ message: "User is not a coach" });
  }

  const athleteUser = await User.findById(athleteId);
  if (!athleteUser) {
    return res.status(404).json({ message: "Athlete not found" });
  }

  if (!coachUser.athletes.includes(athleteId)) {
    return res
      .status(400)
      .json({ message: "Athlete is not on the coach's roster" });
  }

  const existingProgram = await Program.findOne({
    coachId: coachId,
    athleteId: athleteId,
  });
  if (existingProgram) {
    return res.status(409).json({
      message: "A program already exists for this coach and athlete",
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

export { PostProgram };
