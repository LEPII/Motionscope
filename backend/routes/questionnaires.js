const auth = require("../middleware/auth");
const {
  Questionnaire,
  validate,
  patchedValidate,
} = require("../model/questionnaire");
const { User } = require("../model/user");
const express = require("express");
const router = express.Router();

// -- COACH'S ENDPOINTS --

// Get a specific Athlete's Questionnaire

router.get("/", async (req, res) => {
  try {
    const athlete = await User.findById(req.params.id);
    if (!athlete) {
      return res.status(404).json({ error: "Athlete not found" });
    }

    // Ensure the coach is authorized to view the athlete's questionnaire
    if (req.user.role !== "COACH" || athlete.coachId !== req.user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    // Find the questionnaire for the athlete
    const questionnaire = await Questionnaire.findOne({
      athleteId: athlete._id,
    });

    if (!questionnaire) {
      return res.status(404).json({ error: "Questionnaire not found" });
    }

    res.json(questionnaire);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

/// -- ATHLETE'S ENDPOINTS --

// Post Questionnaire

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let question = new Questionnaire(req.body);
  question.submitted = true;

  question = await question.save();

  res.send(question);
});

// Patch Questionnaire

router.patch("/:id", async (req, res) => {
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
