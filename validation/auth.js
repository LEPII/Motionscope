import Joi from "./common.js";

const validateAuth = (req) => {
  const schema = {
    email: Joi.string().min(5).max(255).required().trim().lowercase().email(),
    password: Joi.string().required().min(8).max(1024),
  };

  return Joi.validate(req, schema);
};

export { validateAuth };
