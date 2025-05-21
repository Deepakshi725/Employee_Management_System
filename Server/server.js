import express from "express";
import Router from "./routes.js";
import { isConnected, connected } from "./db.js";
import cors from "cors";
import dotenv from "dotenv";
import { Users } from "./models/User.js";

const app = express();
const port = process.env.PORT || 5000;

dotenv.config();

// Configure CORS
app.use(cors({
  origin: '*', // Allow all origins during development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something broke!' });
});

// Health check endpoint
app.get("/", (req, res) => {
  try {
    res.json({
      database: isConnected() ? "connected" : "disconnected",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Mount the router
app.use("/api", Router);

// Connect to database before starting server
try {
  await connected();
  app.listen(port, () => {
    console.log(`🚀 Server running on PORT: ${port}`);
    console.log(`📡 Frontend URL: http://localhost:8080`);
  });
} catch (error) {
  console.error('Failed to start server:', error);
  process.exit(1);
}