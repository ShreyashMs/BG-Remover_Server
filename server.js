import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./configs/mongodb.js";

const app = express();
const PORT = process.env.PORT || 4000;

async function startServer() {
  await connectDB();

  app.use(express.json());
  app.use(cors());

  app.get("/", (req, res) => res.send("API WORKING !!!"));

  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

// Start the server
startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
