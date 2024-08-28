const mongoose = require("mongoose");
const users = require("./routes/users");
const express = require("express");
const app = express();

mongoose
  .connect("mongodb://localhost:27017/motionscope")
  .then(() => console.log("connected to MongoDB for the dub"))
  .catch((err) => console.error("Could not connect to MongoDB..."));

app.use(express.json());
app.use("/api/users", users);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`$listening on port: ${port}...`));
