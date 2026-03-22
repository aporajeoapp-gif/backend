import * as dotenv from "dotenv";
dotenv.config(); // ✅ ONLY HERE

import app from "./app";
import connectDB from "./config/db";

const PORT = process.env.PORT || 3000;

connectDB();

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});