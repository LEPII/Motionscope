import Joi from "joi";
import bcrypt from "bcrypt";
import { User, validateUser } from "../model/user.js";
import _ from "lodash";

const validateAuth = (req) => {
  const schema = {
    email: Joi.string().min(5).max(255).required().trim().lowercase().email(),
    password: Joi.string().required().min(8).max(1024),
  };

  return Joi.validate(req, schema);
};

// logging in user

const login = async (req, res) => {
  const { error } = validateAuth(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("Invalid email or password");

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send("Invalid email or password");

  const token = user.generateAuthToken();
  res.send(token);
};

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

export { login, getCurrentUser, registerUser };