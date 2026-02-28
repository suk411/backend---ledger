import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import accountRoutes from "./routes/account.route.js";
import authRoutes from "./routes/auth.route.js";

dotenv.config();
const app = express();

app.use(express.json());
app.use(cookieParser());

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/accounts", accountRoutes);

export default app;
