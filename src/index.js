import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./db/index.js";
// Import routes
import userRoutes from "./routes/user.routes.js";
import postRoutes from "./routes/post.routes.js";

// Configure environment variables
dotenv.config({
  path: "./.env",
});

// Initialize express app
const app = express();

// Database connection
connectDB()
  .then(() => {
    // Middlewares
    app.use(
      cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
      })
    );
    app.use(cookieParser());
    app.use(express.json({ limit: "16kb" }));
    app.use(express.urlencoded({ limit: "16kb", extended: true }));
    app.use(express.static("public"));

    // Routes
    app.use("/users", userRoutes);
    app.use("/posts", postRoutes);

    // Start server
    app.listen(process.env.PORT, () => {
      console.log("Server is running on port:", process.env.PORT);
    });
  })
  .catch((error) => {
    console.log("MongoDB connection failed!!!", error);
  });