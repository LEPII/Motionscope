import Joi from "./common.js";
import {
  exerciseTypeEnum,
  muscleGroupEnum,
  movementPatternEnum,
  loadTypeEquipmentEnum,
  typeOfExerciseEnum,
  unilateralBilateralEnum,
} from "../constants/exercise.js";

const validateExercises = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  type: Joi.string()
    .valid(...exerciseTypeEnum)
    .required()
    .default("custom"),
  createdBy: Joi.string(),
  description: Joi.string().min(10).max(1000),
  muscleGroup: Joi.array()
    .items(Joi.string().valid(...muscleGroupEnum))
    .optional(),
  movementPattern: Joi.array()
    .items(Joi.string().valid(...movementPatternEnum))
    .optional(),
  loadTypeEquipment: Joi.array()
    .items(Joi.string().valid(...loadTypeEquipmentEnum))
    .optional(),
  typeOfExercise: Joi.string()
    .valid(...typeOfExerciseEnum)
    .required(),
  unilateralBilateral: Joi.array()
    .items(Joi.string().valid(...unilateralBilateralEnum))
    .optional(),
});

export { validateExercises };
