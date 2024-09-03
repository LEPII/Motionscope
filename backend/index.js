require("dotenv").config();
const config = require("config");
const auth = require("./routes/auth");
const mongoose = require("mongoose");
const users = require("./routes/users");
const express = require("express");

const app = express();

if (!config.get("jwtPrivateKey")) {
  console.error("FATAL ERROR: jwtPrivateKey is not not defined.");
  process.exit(1);
}

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("connected to MongoDB for the dub"))
  .catch((err) => console.error("Could not connect to MongoDB..."));

app.use(express.json());
app.use("/api/users", users);
app.use("/api/auth", auth);
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`$listening on port: ${port}...`));
