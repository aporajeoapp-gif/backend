import express from "express";
import cors from "cors";

import userrouter from "./api/v1/routes/user.route";
import v1router from "./api/v1";
// import connectDB from "./config/db";
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.get("/", (_, res) => {
  res.send("Welcome to Oporajeo.....");
});
app.use("/api/v1", v1router);

export default app;
