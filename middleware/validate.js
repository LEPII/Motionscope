// Validates req.body against a Joi schema before the controller runs.
// On success req.body is replaced with Joi's output (trimmed, converted, defaults applied).
// Pass { noDefaults: true } on PATCH routes so defaults don't overwrite fields the client left out.
export default (schema, options = {}) =>
  (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      ...options,
    });

    if (error) {
      return res.status(400).json({
        message: "Validation failed.",
        details: error.details.map((d) => d.message),
      });
    }

    req.body = value;
    next();
  };
