import { User, validateUser } from "../model/user.js";
import bcrypt from "bcrypt";
import _ from "lodash";

const getCurrentUser = async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  res.send(user);
};

const registerUser = async (req, res) => {
  const { error } = validateUser.validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("User already registered");

  user = new User(
    _.pick(req.body, [
      "firstName",
      "lastName",
      "username",
      "email",
      "password",
      "role",
      "athletes",
    ])
  );
  const salt = await bcrypt.genSalt(12);
  user.password = await bcrypt.hash(user.password, salt);

  await user.save();

  // generates jwt token
  const token = user.generateAuthToken();

  // sets the following to the client ~> A. the response header with the JWT // B. the specified user properties
  res
    .header("x-auth-token", token)
    .send(_.pick(user, ["_id", "firstName", "email", "role"]));
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
  getCurrentUser,
  registerUser,
  addAthleteToRoster,
  deleteAthleteFromRoster,
  deleteSelfFromTheCoachRoster,
};
