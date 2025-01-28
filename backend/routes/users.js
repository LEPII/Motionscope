import auth from "../middleware/auth.js";
import express from "express";
const router = express.Router();
import {
  getCurrentUser,
  registerUser,
} from "../controllers/usersController.js";

// get current user
router.get("/me", auth, getCurrentUser);

// register user
router.post("/", registerUser);

export default router;
