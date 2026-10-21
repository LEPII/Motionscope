import Joi from "joi";
import JoiObjectId from "joi-objectid";

// Registers Joi.objectId() once, so every validation file that imports Joi from here can use it
Joi.objectId = JoiObjectId(Joi);

// Builds a PATCH version of an object schema: required keys become optional, forbidden keys stay forbidden
const toUpdateSchema = (schema) => {
  const { keys = {} } = schema.describe();
  const requiredKeys = Object.keys(keys).filter(
    (key) => keys[key].flags?.presence === "required"
  );
  return schema.fork(requiredKeys, (field) => field.optional()).min(1);
};

export { toUpdateSchema };
export default Joi;
