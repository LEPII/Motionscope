const config = require("config");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Joi = require("joi");
const _ = require("lodash");
const { User } = require("../model/user");
const express = require("express");
const router = express.Router();


const jwtPrivateKey = config.get("jwtPrivateKey");

// register user
router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("Invalid email or password");

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send("Invalid email or password");

  const token = jwt.sign({ _id: user._id }, jwtPrivateKey);
  res.send(token);
});

function validate(req) {
  const schema = {
    email: Joi.string().min(5).max(255).required().trim().lowercase().email(),
    password: Joi.string().required().min(8).max(1024),
  };

  return Joi.validate(req, schema);
}

module.exports = router;
