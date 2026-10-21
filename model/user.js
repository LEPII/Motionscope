import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { roleEnum, unitPreferenceEnum } from "../constants/user.js";

dotenv.config();

const userSchema = new mongoose.Schema(
  {
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
    role: {
      type: String,
      enum: roleEnum,
      required: true,
    },
    unitPreference: {
      type: String,
      enum: unitPreferenceEnum,
      default: "lbs",
    },
    athletes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    confirmed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    { _id: this._id },
    process.env.MOTIONSCOPE_JWT_PRIVATE_KEY,
  );
  return token;
};

const User = mongoose.model("User", userSchema);

const refreshTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  isValid: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 },
  },
});

const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema);

export { User, RefreshToken };
