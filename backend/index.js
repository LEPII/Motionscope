// require("dotenv").config();
import mongoose from "mongoose";
import express from "express";
import auth from "./routes/auth.js";
import blocks from "./routes/blocks.js";
import customExercises from "./routes/customExercises.js";
import presetExercises from "./routes/presetExercises.js";
import programs from "./routes/programs.js";
import questionnaires from "./routes/questionnaires.js";
import users from "./routes/users.js"; 

const app = express();

app.use(express.json());

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("connected to MongoDB for the dub"))
  .catch((err) => console.error("Could not connect to MongoDB..."));

app.use(express.json());
app.use("/api/auth", auth);
app.use("/api/blocks", blocks);
app.use("/api/customExercises", customExercises);
app.use("/api/presetExercises", presetExercises);
app.use("/api/programs", programs);
app.use("/api/questionnaires", questionnaires);
app.use("/api/users", users);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`$listening on port: ${port}...`));