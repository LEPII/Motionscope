import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { User } from "../model/user.js";
dotenv.config();

export default async (req, res, next) => {
  const token = req.header("x-auth-token");
  if (!token) return res.status(401).send("Access denied. No token provided");

  // jwt.verify checks the signature and decodes the payload; it throws on a bad or expired token.
  // Only verify is inside the try, so DB errors and errors from later middleware aren't reported as "Invalid Token."
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.MOTIONSCOPE_JWT_PRIVATE_KEY);
  } catch (ex) {
    return res.status(401).send("Invalid Token.");
  }

  req.user = await User.findById(decoded._id).select("-password");
  if (!req.user) return res.status(401).send("Access denied. User not found.");
  next();
};
