import express from "express";
import adminController from "../controllers/admin.controller.js";
import authMiddleware from "../middleware/user.auth.middleware.js";
import { adminMiddleware } from "../middleware/admin.auth.middleware.js";
const router = express.Router();

// Admin only
// Dashboard
router.get(
  "/dashboard",
  authMiddleware.authMiddleware,
  adminMiddleware,
  adminController.getAdminDashboard,
);

// User + account details
router.get(
  "/user",
  authMiddleware.authMiddleware,
  adminMiddleware,
  adminController.searchUserOrAccount,
);
// Deposit orders - by orderId or by userId (paginated)
router.get(
  "/deposits",
  authMiddleware.authMiddleware,
  adminMiddleware,
  adminController.getAdminDepositOrders,
);
// Transactions - by userId (paginated)
router.get(
  "/transactions",
  authMiddleware.authMiddleware,
  adminMiddleware,
  adminController.getUserTransactionsPaginated,
);
export default router;
