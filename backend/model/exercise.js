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
    movementPattern: {
      type: [String],
      enum: [
        "Push",
        "Pull",
        "Hinge",
        "Squat",
        "LungeStep",
        "Rotation",
        "AntiRotation",
      ],
    },
    loadTypeEquipment: {
      type: [String],
      enum: ["Barbell", "Dumbbell", "Bodyweight", "Machine", "Cable Machine"],
    },
    typeOfExercise: {
      type: String,
      enum: ["Compound", "Isolation"],
      required: true,
    },
    unilateralBilateral: {
      type: [String],
      enum: ["Bilateral", "Unilateral"],
    },
  },
  { timestamps: true }
);

exerciseSchema.index({ name: "text" });
exerciseSchema.index({ muscleGroup: 1 });
exerciseSchema.index({ movementPattern: 1 });
exerciseSchema.index({ loadTypeEquipment: 1 });
exerciseSchema.index({ typeOfExercise: 1 });
exerciseSchema.index({ createdBy: 1 });

const Exercise = mongoose.model("exercise", exerciseSchema);

const validateExercises = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  type: Joi.string().valid("preset", "custom").required().default("custom"),
  createdBy: Joi.string(),
  description: Joi.string().min(10).max(1000),
  muscleGroup: Joi.array()
    .items(
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
    )
    .optional(),
  movementPattern: Joi.array()
    .items(
      Joi.string().valid(
        "Push",
        "Pull",
        "HingeS",
        "Squat",
        "LungeStep",
        "Rotation",
        "AntiRotation"
      )
    )
    .optional(),
  loadTypeEquipment: Joi.array()
    .items(
      Joi.string().valid(
        "Barbell",
        "Dumbbell",
        "Bodyweight",
        "Machine",
        "Cable Machine"
      )
    )
    .optional(),
  typeOfExercise: Joi.string().valid("Compound", "Isolation").required(),
  unilateralBilateral: Joi.array()
    .items(Joi.string().valid("Bilateral", "Unilateral"))
    .optional(),
});

export { exerciseSchema, Exercise, validateExercises };
