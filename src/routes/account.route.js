import express from "express";
import getUserBalanceController, { getOwnDepositOrders, getVipStatus, claimVipMonthlyBonus } from "../controllers/account.controller.js";
import authMiddleware from "../middleware/user.auth.middleware.js";

const router = express.Router();
// GET  /api/account/balance
router.get("/balance", authMiddleware.authMiddleware, getUserBalanceController);
// GET /api/account/my-deposits
router.get(
  "/my-deposits",
  authMiddleware.authMiddleware,
  getOwnDepositOrders,
);
// GET /api/account/vip
router.get("/vip", authMiddleware.authMiddleware, getVipStatus);
// POST /api/account/vip/checkin
router.post("/vip/checkin", authMiddleware.authMiddleware, claimVipMonthlyBonus);

export default router;
