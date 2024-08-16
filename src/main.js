import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json({ limit: "16kb" }));
app.use(express.static("public"));
app.use(express.urlencoded({ limit: "16kb", extended: true }));

//routes
import userRoutes from "./routes/user.routes.js";
import postRoutes from "./routes/post.routes.js";

app.use("/users", userRoutes);
app.use("/posts", postRoutes);

export { app };
