import Joi from "./common.js";

const validateAuth = Joi.object({
  email: Joi.string().min(5).max(255).required().trim().lowercase().email(),
  password: Joi.string().required().min(8).max(1024),
});

export { validateAuth };
