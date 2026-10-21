import Joi from "joi";
import JoiObjectId from "joi-objectid";

// Registers Joi.objectId() once, so every validation file that imports Joi from here can use it
Joi.objectId = JoiObjectId(Joi);

export default Joi;
