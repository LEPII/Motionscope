import {
  login,
  registerUser,
  getCurrentUser,
} from "../controllers/authController.js";
import auth from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import { loginSchema } from "../validation/auth.js";
import { userSchema } from "../validation/user.js";
import express from "express";
const router = express.Router();

/// Open Routes

// logging in user
router.post("/", validate(loginSchema), login);

// register user
router.post("/", validate(userSchema), registerUser);

/// Secure Routes

// get current user
router.get("/me", auth, getCurrentUser);

export default router;
