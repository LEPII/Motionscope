import { User, validateUser } from "../model/user.js";
import bcrypt from "bcrypt";
import _ from "lodash";

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

const addAthleteToRoster = async (req, res) => {
  const coachId = req.user._id;
  const { athleteId } = req.body;

  if (req.user.role !== "coach") {
    return res.status(403).send("Only coaches can manage their roster.");
  }

  const athlete = await User.findById(athleteId);
  if (!athlete || athlete.role !== "athlete") {
    return res.status(400).send("Invalid athlete ID provided.");
  }

  const coach = await User.findByIdAndUpdate(
    coachId,
    { $addToSet: { athletes: athleteId } },
    { new: true }
  ).populate("athletes");

  if (!coach) {
    return res.status(404).send("Coach not found.");
  }

  res.status(200).send(coach.athletes);
};

const deleteAthleteFromRoster = async (req, res) => {
  const coachId = req.user._id;
  const { athleteId } = req.body;

  if (req.user.role !== "coach") {
    return res.status(403).send("Only coaches can manage their roster.");
  }

  const athlete = await User.findById(athleteId);
  if (!athlete || athlete.role !== "athlete") {
    return res.status(400).send("Invalid athlete ID provided.");
  }

  // Verify that the athlete is on the coach's roster BEFORE attempting to remove -> Maybe move this to a middleware function
  const coach = await User.findById(coachId).populate("athletes");
  const isAthleteOnRoster = coach.athletes.some(
    (athlete) => athlete._id.toString() === athleteId
  );

  if (!isAthleteOnRoster) {
    return res.status(400).send("Athlete is not on your roster.");
  }

  const updatedCoach = await User.findByIdAndUpdate(
    coachId,
    { $pull: { athletes: athleteId } },
    { new: true }
  ).populate("athletes");

  if (!updatedCoach) {
    return res.status(404).send("Coach not found.");
  }

  res.status(200).send(updatedCoach.athletes);
};

const deleteSelfFromTheCoachRoster = async (req, res) => {
  const athleteId = req.user._id;
  const { coachId } = req.body;

  if (req.user.role !== "athlete") {
    return res
      .status(403)
      .send("Only athletes can remove themselves from a coach's roster.");
  }

  if (!coachId) {
    return res
      .status(400)
      .send("Coach ID is required to remove yourself from their roster.");
  }

  // Verify that the athlete is on the coach's roster BEFORE attempting to remove -> Maybe move this to a middleware function
  const coach = await User.findById(coachId).populate("athletes");

  if (!coach) {
    return res.status(404).send("Coach not found.");
  }

  const isAthleteOnRoster = coach.athletes.some(
    (athlete) => athlete._id.toString() === athleteId
  );

  if (!isAthleteOnRoster) {
    return res
      .status(400)
      .send("You are not currently on that coach's roster.");
  }

  const updatedCoach = await User.findByIdAndUpdate(
    coachId,
    { $pull: { athletes: athleteId } },
    { new: true }
  ).populate("athletes");

  if (!updatedCoach) {
    return res.status(404).send("Coach not found.");
  }

  res.status(200).send(updatedCoach.athletes);
};

export {
  getRosterList,
  addAthleteToRoster,
  deleteAthleteFromRoster,
  deleteSelfFromTheCoachRoster,
};
