import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { User } from "../model/user.js";
dotenv.config();

export default async (req, res, next) => {
  const token = req.header("x-auth-token");
  if (!token) return res.status(401).send("Access denied. No token provided");

  // this verify method verified the JWT token. If its valid, it will decode it and return the payload.

  try {
    const decoded = jwt.verify(token, process.env.MOTIONSCOPE_JWT_PRIVATE_KEY);
    req.user = await User.findById(decoded.userId).select("-password");
    next();
  } catch (ex) {
    res.status(400).send("Invalid Token.");
  }
};
