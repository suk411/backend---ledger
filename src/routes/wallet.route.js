// src/routes/wallet.route.js
import express from "express";
import authMiddleware from "../middleware/user.auth.middleware.js";
import {
  deposit,
  withdraw,
  getBalance,
  getLedger,
} from "../controllers/wallet.controller.js";

const router = express.Router();

router.use(authMiddleware.authMiddleware);

// Get balance
// Get /api/wallet/balance
router.get("/balance", async (req, res) => {
  const balance = await getBalance(req.user.userId);
  res.json({ balance, status: "success" });
});

// Get transaction history
// Get /api/wallet/ledger
router.get("/ledger", async (req, res) => {
  const ledger = await getLedger(req.user.userId);
  res.json({ ledger, status: "success" });
});

// Deposit (payment gateway calls this)
// Post /api/wallet/deposit
router.post("/deposit", async (req, res) => {
  const { amount, orderId, remark } = req.body;
  try {
    const result = await deposit(req.user.userId, amount, orderId, remark);
    res.json({ ...result, status: "success" });
  } catch (error) {
    res.status(500).json({ msg: error.msg, status: "failed" });
  }
});

export default router;
