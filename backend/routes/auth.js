import {
  login,
  registerUser,
  getCurrentUser,
} from "../controllers/authController.js";
import auth from "../middleware/auth.js";
import express from "express";
const router = express.Router();

/// Open Routes

// logging in user
router.post("/", login);

// register user
router.post("/", registerUser);

/// Secure Routes

// get current user
router.get("/me", auth, getCurrentUser);

export default router;
