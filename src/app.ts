import express from "express";
import cors from "cors";

import userrouter from "./api/v1/routes/user.route";
import v1router from "./api/v1";
import { successLoggerMiddleware, errorLoggerMiddleware, globalErrorLoggerMiddleware } from "./api/v1/middleware/logging.middleware";

const app = express();
const VERSION = "1.0.0";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Register success and failure logging middlewares
app.use(successLoggerMiddleware);
app.use(errorLoggerMiddleware);

app.get("/", (_, res) => {
  res.send("Welcome to Oporajeo.....");
});

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    version: VERSION,
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/v1", v1router);


app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Register global error logger middleware
app.use(globalErrorLoggerMiddleware);

app.use((err: any, req: any, res: any, next: any) => {
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err : {},
  });
});

export default app;
