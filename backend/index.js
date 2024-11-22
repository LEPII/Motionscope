require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const auth = require("./routes/auth");
// const blocks = require("./routes/blocks");
// const customExercises = require("./routes/customExercises");
// const presetExercises = require("./routes/presetExercises");
const programs = require("./routes/programs");
const questionnaires = require("./routes/questionnaires");
const users = require("./routes/users");

const app = express();

app.use(express.json());

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("connected to MongoDB for the dub"))
  .catch((err) => console.error("Could not connect to MongoDB..."));

app.use(express.json());
app.use("/api/auth", auth);
// app.use("/api/blocks", blocks);
// app.use("/api/customExercises", customExercises);
// app.use("/api/presetExercises", presetExercises);
app.use("/api/programs", programs);
app.use("/api/questionnaires", questionnaires);
app.use("/api/users", users);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`$listening on port: ${port}...`));
