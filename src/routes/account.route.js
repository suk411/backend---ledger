import express from "express";
import getUserBalanceController, {
  getOwnDepositOrders,
  adminFindDepositOrders,
} from "../controllers/account.controller.js";
import authMiddleware from "../middleware/user.auth.middleware.js";
import { adminMiddleware } from "../middleware/admin.auth.middleware.js";

const router = express.Router();
// GET  /api/account/balance
router.get("/balance", authMiddleware.authMiddleware, getUserBalanceController);
// GET /api/account/my-deposits
router.get(
  "/my-deposits",
  authMiddleware.authMiddleware,
  getOwnDepositOrders,
);
// GET /api/account/admin/deposits?orderId=... | ?userId=...&page=&limit=
router.get(
  "/admin/deposits",
  authMiddleware.authMiddleware,
  adminMiddleware,
  adminFindDepositOrders,
);

export default router;
