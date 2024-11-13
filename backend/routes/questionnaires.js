const auth = require("../middleware/auth");
const {
  Questionnaire,
  validate,
  patchedValidate,
} = require("../model/questionnaire");
// const { User } = require("../model/user"); - ? 
const express = require("express");
const router = express.Router();

// -- COACH'S ENDPOINTS --

// Get a specific Athlete's Questionnaire

// Find the questionnaire from the athlete - need to refactor and ?embed? the

router.get("/:id", async (req, res) => {
  const questionnaire = await Questionnaire.findById(req.params.id);
  res.send(questionnaire);
});

/// -- ATHLETE'S ENDPOINTS --

// Post Questionnaire

router.post("/", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let question = new Questionnaire(req.body);
  question.submitted = true;

  question = await question.save();

  res.send(question);
});

// Patch Questionnaire

router.patch("/:id", auth, async (req, res) => {
  const { error } = patchedValidate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const update = { ...req.body };
  delete update.submitted;

  const questionnaire = await Questionnaire.findByIdAndUpdate(
    req.params.id,
    update,
    { new: true, projection: { submitted: 0 } }
  );

  if (!questionnaire) return res.status(404).send("Questionnaire not found");

  res.send(questionnaire);
});

module.exports = router;
