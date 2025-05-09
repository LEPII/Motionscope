import { User } from "../model/user.js";
import { Block } from "../model/block.js";
import { CompDay } from "../model/compDay.js";

const authorizeAthlete = (req, res, next) => {
  if (req.user && req.user.role === "athlete") {
    next();
  } else {
    res.status(403).send("Unauthorized. Athlete's only.");
  }
};

const authorizeCoach = (req, res, next) => {
  if (req.user && req.user.role === "coach") {
    next();
  } else {
    res.status(403).send("Unauthorized. Coaches only.");
  }
};

const authorizeDeveloper = (req, res, next) => {
  if (req.user && req.user.role === "developer") {
    next();
  } else {
    res.status(403).send("Unauthorized. Coaches only.");
  }
};

// Middleware to ensure a logged-in coach is authorized for a specific athlete's resource (Programs, CompDays and Block)
const authorizeCoachForAthleteResource = async (req, res, next) => {
  const coachId = req.user._id;
  const { athleteId, programId, blockId, compDayId } = req.params;

  if (!athleteId) {
    return res.status(400).send("athleteId is required");
  }

  if (req.user.role !== "coach") {
    return res
      .status(403)
      .send(
        "Unauthorized. Only coaches can access this resource for an athlete."
      );
  }

  const coach = await User.findById(coachId).populate("athletes");
  const isAthleteOnRoster = coach.athletes.some(
    (athlete) => athlete._id.toString() === athleteId
  );

  if (!isAthleteOnRoster) {
    return res.status(403).send("Unauthorized. Athlete is not on your roster.");
  }

  if (compDayId) {
    const compDay = await CompDay.findById(compDayId);
    if (!compDay || compDay.athlete.toString() !== athleteId) {
      return res
        .status(403)
        .send("Unauthorized. CompDay does not belong to this athlete.");
    }
  }

  if (blockId) {
    const block = await Block.findById(blockId);
    if (!block || block.athlete.toString() !== athleteId) {
      return res
        .status(403)
        .send("Unauthorized. Block does not belong to this athlete.");
    }
  }
  next();
};

// Middleware to ensure a logged-in athlete is authorized for a specific CompDay or Block associated with them.

const authorizeAthleteForResource = async (req, res, next) => {
  const athleteId = req.user._id;
  const { compDayId, blockId } = (req.params = req.params);

  if (req.user.role !== "athlete") {
    return res
      .status(403)
      .send("Unauthorized. Only athletes can access their own resources.");
  }

  if (compDayId) {
    const compDay = await CompDay.findById(compDayId);
    if (!compDay || compDay.athlete.toString() !== athleteId.toString()) {
      return res
        .status(403)
        .send("Unauthorized. CompDay does not belong to you");
    }
  }

  if (blockId) {
    const block = await Block.findById(blockId);
    if (!block || block.athlete.toString() !== athleteId.toString()) {
      return res.status(403).send("Unauthorized. Block does not belong to you");
    }
  }
  next();
};

export {
  authorizeAthlete,
  authorizeCoach,
  authorizeDeveloper,
  authorizeCoachForAthleteResource,
  authorizeAthleteForResource,
};
