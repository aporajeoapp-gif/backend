import app from "./app";
import serverless from "serverless-http";
import connectDB from "./config/db";

// ❌ NO dotenv here
// ❌ NO app.listen here

connectDB(); // cached between invocations

export const handler = serverless(app);
