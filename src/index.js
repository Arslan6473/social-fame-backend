import connectDB from "./db/index.js";
import { app } from "./main.js";
import dotenv from "dotenv";

dotenv.config({
  path: "./.env",
});

connectDB()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log("Server is runing on port : ", process.env.PORT);
    });
  })
  .catch((error) => {
    console.log("MongoDB connection feild !!! ", error);
  });
