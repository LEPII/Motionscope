const bcrypt = require('bcrypt')
const _ = require("lodash");
const { User, validate } = require("../model/user");
const express = require("express");
const router = express.Router();

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
  res.send(_.pick(user, ["_id", "firstName", "email"]));
});

module.exports = router;