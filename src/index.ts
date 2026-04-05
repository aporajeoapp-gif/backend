import app from "./app";
import serverless from "serverless-http";
import connectDB from "./config/db";

connectDB();

export const handler = serverless(app);
