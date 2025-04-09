import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import Joi from "joi";
import JoiObjectId from "joi-objectid";
import mongoose from "mongoose";

dotenv.config();
Joi.objectId = JoiObjectId(Joi);

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    minLength: 1,
    maxLength: 50,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    minLength: 1,
    maxLength: 50,
    required: true,
    trim: true,
  },
  username: {
    type: String,
    minLength: 5,
    maxLength: 30,
    required: true,
    trim: true,
    unique: true,
  },
  email: {
    type: String,
    minLength: 5,
    maxLength: 255,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match:
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
  },
  password: {
    type: String,
    required: true,
    minLength: 8,
    maxLength: 1024,
  },
  role: { type: String, enum: ["coach", "athlete"], required: true },
  athletes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    { _id: this._id },
    process.env.MOTIONSCOPE_JWT_PRIVATE_KEY
  );
  return token;
};

const User = mongoose.model("User", userSchema);

const validateUser = Joi.object({
  firstName: Joi.string().min(1).max(50).required().trim(),
  lastName: Joi.string().min(1).max(50).required().trim(),
  username: Joi.string().min(5).max(30).required().trim(),
  email: Joi.string().min(5).max(255).required().trim().lowercase().email(),
  password: Joi.string().min(8).max(1024).required(),
  role: Joi.string().valid("coach", "athlete").required(),
  athletes: Joi.array().items(Joi.string().hex().length(24)),
});

export { User, validateUser };
