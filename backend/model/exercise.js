const mongoose = require("mongoose");

const exerciseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: String,  
  muscleGroup: String,
  equipment: String,
  imageUrl: String,
});

const Exercise = mongoose.model("Exercise", exerciseSchema);

exports.exerciseSchema = exerciseSchema;
exports.Exercise = Exercise; 
