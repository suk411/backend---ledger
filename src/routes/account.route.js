import express from "express";
import getUserBalanceController, { getOwnDepositOrders } from "../controllers/account.controller.js";
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

export default router;
