import "dotenv/config";
import "express-async-errors";
import express from "express";
import myRoutes from "./routes/routes.js";
import dbInitializer from "./config/db.js";

const app = express();
myRoutes(app);
dbInitializer();

//  handles unhandled promise rejections
process.on("unhandledRejection", (ex) => {
  throw ex;
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`listening on port: ${port}...`));
