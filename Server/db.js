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
    console.log(process.env.database_URI);
    await mongoose.connect(process.env.database_URI);
    console.log("Database connected successfully");
  } catch (error) {
    console.log(error);
  }
};
const isConnected = () => {
  return mongoose.connection.readyState === 1;
};

export {
  isConnected,
  connected,
};