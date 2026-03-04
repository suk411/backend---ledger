import express from "express";
import {
  initiateDeposit,
  paymentCallback,
} from "../controllers/payment.controller.js";
import authMiddleware from "../middleware/user.auth.middleware.js";

const router = express.Router();

// Post /api/payment/deposit
router.post("/deposit", authMiddleware.authMiddleware, initiateDeposit);
// Post /api/payment/callback
router.post("/callback", paymentCallback);

export default router;
