const mongoose = require("mongoose");

const questionnaire = new mongoose.Schema({
  birthday: {
    type: Date,
    required: true,
  },
  gender: {
    type: String,
    enum: ["Male", "Female"],
    required: true,
  },
});
