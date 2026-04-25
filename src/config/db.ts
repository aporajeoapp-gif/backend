import mongoose from "mongoose";

let isConnected = false;

const connectDB = async (): Promise<void> => {
  if (isConnected) {
    return;
  }

  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }

    const db = await mongoose.connect(process.env.MONGO_URI);
    isConnected = db.connections[0].readyState === 1;

    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed", error);
    // In serverless, we don't want to exit the process, just throw the error
    throw error;
  }
};

export default connectDB;
