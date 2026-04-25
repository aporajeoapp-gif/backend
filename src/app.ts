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

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global Error Handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error("Global Error Handler:", err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err : {},
  });
});

export default app;
