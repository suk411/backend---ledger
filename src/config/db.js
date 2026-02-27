import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "node:dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);
dotenv.config();

function connectDB() {
  const mongoURI = process.env.MONGO_URI;
  mongoose
    .connect(mongoURI) // no extra options needed in Mongoose v6+
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch((err) => {
      console.error("❌ Error connecting to MongoDB:", err);
      process.exit(1);
    });
}

export { connectDB };
