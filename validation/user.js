import Joi from "./common.js";
import { roleEnum, unitPreferenceEnum } from "../constants/user.js";

const userSchema = Joi.object({
  firstName: Joi.string().min(1).max(50).required().trim(),
  lastName: Joi.string().min(1).max(50).required().trim(),
  username: Joi.string().min(5).max(30).required().trim(),
  email: Joi.string().min(5).max(255).required().trim().lowercase().email(),
  password: Joi.string().min(8).max(1024).required(),
  role: Joi.string()
    .valid(...roleEnum)
    .required(),
  unitPreference: Joi.string()
    .valid(...unitPreferenceEnum)
    .default("lbs"),
  athletes: Joi.array().items(Joi.objectId()),
});

const userUpdateSchema = Joi.object({
  firstName: Joi.string().min(1).max(50).optional(),
  lastName: Joi.string().min(1).max(50).optional(),
  email: Joi.string().email().optional(),
  unitPreference: Joi.string()
    .valid(...unitPreferenceEnum)
    .optional(),
}).min(1);

const refreshTokenSchema = Joi.object({
  userId: Joi.objectId().required(),
  token: Joi.string().required(),
  isValid: Joi.boolean().default(true),
  expiresAt: Joi.date().required(),
});

const passwordResetSchema = Joi.object({
  userId: Joi.objectId().required(),
  token: Joi.string().required(),
  used: Joi.boolean().default(false),
  expiresAt: Joi.date().required(),
});

export {
  userSchema,
  userUpdateSchema,
  refreshTokenSchema,
  passwordResetSchema,
};
