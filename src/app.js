import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import accountRoutes from "./routes/account.route.js";
import authRoutes from "./routes/auth.route.js";
import walletRoutes from "./routes/wallet.route.js";
import adminRoutes from "./routes/admin.route.js";
import paymentRoutes from "./routes/payment.route.js";
import agentRoutes from "./routes/agent.route.js";
import logger from "./utils/logger.js";

dotenv.config();
const app = express();

app.use(express.json());
app.use(cookieParser());
// CORS
const ALLOWED_ORIGINS =
  process.env.CORS_ORIGINS?.split(",").map((s) => s.trim()).filter(Boolean) || [
    "https://1xking.vercel.app",
    "https://emerald-admin-suite.vercel.app",
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:8080",
    "https://admin-k-ing.vercel.app",
    
  ];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      callback(null, ALLOWED_ORIGINS.includes(origin));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// ✅ Request/response logger (one-liners for every request)
app.use(logger.requestLogger());
// Use routes
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/account/", accountRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/agent", agentRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    msg: "server is running but route not found",
    status: "failed",
  });
});

// Centralized error handler to capture full stacks
app.use(logger.errorHandler());

export default app;
