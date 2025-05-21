import mongoose from "mongoose";
import dotenv from "dotenv";

const loadEnv = async () => {
  try {
    await dotenv.config();
    console.log("Environment variables loaded successfully");
  } catch (error) {
    console.error("Error loading environment variables:", error);
  }
};

let connected = async () => {
  await loadEnv();
  try {
    console.log("Attempting to connect to database...");
    if (!process.env.database_URI) {
      throw new Error("Database URI is not defined in environment variables");
    }
    await mongoose.connect(process.env.database_URI);
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection error:", error);
    throw error; // Re-throw the error to be handled by the server
  }
};
const isConnected = () => {
  return mongoose.connection.readyState === 1;
};

export {
  isConnected,
  connected,
};