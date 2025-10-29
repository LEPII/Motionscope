import Joi from "joi";
import mongoose from "mongoose";

const exerciseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: true,
      minLength: 3,
      maxLength: 100,
      unique: true,
    },
    description: { type: String, minLength: 10, maxLength: 1000 },
    muscleGroup: {
      type: [String],
      enum: [
        "Upper Chest",
        "Mid Chest",
        "Lower Chest",
        "Upper Back",
        "Lower Back",
        "Lats",
        "Traps",
        "Rhomboids",
        "Erector Spinae",
        "Front Delts",
        "Side Delts",
        "Rear Delts",
        "Biceps",
        "Brachialis",
        "Triceps Long Head",
        "Triceps Lateral Head",
        "Triceps Medial Head",
        "Forearm Flexors",
        "Forearm Extensors",
        "Abdominals",
        "Obliques",
        "Transverse Abdominis",
        "Quadriceps Rectus Femoris",
        "Quadriceps Vastus Lateralis",
        "Quadriceps Vastus Medialis",
        "Quadriceps Vastus Intermedius",
        "Hamstrings Biceps Femoris",
        "Hamstrings Semitendinosus",
        "Hamstrings Semimembranosus",
        "Glutes Maximus",
        "Glutes Medius",
        "Glutes Minimus",
        "Calves Gastrocnemius",
        "Calves Soleus",
      ],
    },
    type: {
      type: String,
      enum: ["preset", "custom"],
      required: true,
      default: "custom",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Exercise = mongoose.model("exercise", exerciseSchema);

const validateExercises = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  description: Joi.string().min(10).max(1000),
  muscleGroup: Joi.array().items(
    Joi.string().valid(
      "Upper Chest",
      "Mid Chest",
      "Lower Chest",
      "Upper Back",
      "Lower Back",
      "Lats",
      "Traps",
      "Rhomboids",
      "Erector Spinae",
      "Front Delts",
      "Side Delts",
      "Rear Delts",
      "Biceps",
      "Brachialis",
      "Triceps Long Head",
      "Triceps Lateral Head",
      "Triceps Medial Head",
      "Forearm Flexors",
      "Forearm Extensors",
      "Abdominals",
      "Obliques",
      "Transverse Abdominis",
      "Quadriceps Rectus Femoris",
      "Quadriceps Vastus Lateralis",
      "Quadriceps Vastus Medialis",
      "Quadriceps Vastus Intermedius",
      "Hamstrings Biceps Femoris",
      "Hamstrings Semitendinosus",
      "Hamstrings Semimembranosus",
      "Glutes Maximus",
      "Glutes Medius",
      "Glutes Minimus",
      "Calves Gastrocnemius",
      "Calves Soleus"
    )
  ),
  type: Joi.string().valid("preset", "custom").required().default("custom"),
  createdBy: Joi.string(),
});

export { exerciseSchema, Exercise, validateExercises };
