import Joi from "./common.js";

const loginSchema = Joi.object({
  email: Joi.string().min(5).max(255).required().trim().lowercase().email(),
  password: Joi.string().required().min(8).max(1024),
});

export { loginSchema };
