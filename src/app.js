import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import accountRoutes from "./routes/account.route.js";
import authRoutes from "./routes/auth.route.js";
import walletRoutes from "./routes/wallet.route.js";
import adminRoutes from "./routes/admin.route.js";

dotenv.config();
const app = express();

app.use(express.json());
app.use(cookieParser());

// ✅ Global request logger
app.use((req, res, next) => {
  console.log(`🌐 ${req.method} ${req.path}`);
  next();
});
// Use routes
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/wallet", walletRoutes);

export default app;
