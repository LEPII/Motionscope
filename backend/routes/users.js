const auth = require("../middleware/auth");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const { User, validate } = require("../model/user");
const express = require("express");
const router = express.Router();

// get current user

router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  res.send(user);
});

// register user
router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("User already registered");

  user = new User(
    _.pick(req.body, ["firstName", "lastName", "username", "email", "password"])
  );
  const salt = await bcrypt.genSalt(12);
  user.password = await bcrypt.hash(user.password, salt);

  await user.save();

  // generates jwt token
  const token = user.generateAuthToken();

  // sets the following to the client ~> A. the response header with the JWT // B. the specified user properties
  res
    .header("x-auth-token", token)
    .send(_.pick(user, ["_id", "firstName", "email"]));
});

module.exports = router;
