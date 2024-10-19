const { Questionnaire, validate } = require("../model/questionnaire");
const { User } = require("../model/user");
const express = require("express");
const router = express.Router();

// -- COACH'S ENDPOINTS --

// Get a specific Athlete's Questionnaire
router.get("/", async (req, res) => {
  try {
    // Find the athlete based on the provided athleteId? Need to finish doing Auth
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

  const questions = await Questionnaire.findById(req.body.QuestionnaireId);
  if (!questions) return res.status(400).send("Invalid questionnaire.");

  // let movie = new Movie({
  //   title: req.body.title,
  //   genre: {
  //     _id: genre._id,
  //     name: genre.name,
  //   },
  //   numberInStock: req.body.numberInStock,
  //   dailyRentalRate: req.body.dailyRentalRate,
  // });
  // movie = await movie.save();

  res.send(movie);
});

// Patch Questionnaire

module.exports = router;
