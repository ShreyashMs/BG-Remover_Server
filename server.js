import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./configs/mongodb.js";

const app = express();
app.use(express.json());
app.use(cors());

app.get("/", async (req, res) => {
  try {
    await connectDB();
    res.send("API WORKING !!!");
  } catch (error) {
    console.error("Database connection failed:", error);
    res.status(500).send("Database connection failed");
  }
});

export default app;
