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
// Update user status (active | suspended | inactive [aka ban])
router.patch(
  "/user",
  authMiddleware.authMiddleware,
  adminMiddleware,
  adminController.updateUserStatusAdmin,
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
// Agent stats - invite tree and totals
router.get(
  "/agent-stats",
  authMiddleware.authMiddleware,
  adminMiddleware,
  adminController.getAgentReferralStatsAdmin,
);
router.post(
  "/deposits/approve",
  authMiddleware.authMiddleware,
  adminMiddleware,
  adminController.approveDepositOrder,
);
router.get(
  "/agent-config",
  authMiddleware.authMiddleware,
  adminMiddleware,
  adminController.getAgentConfig,
);
router.put(
  "/agent-config",
  authMiddleware.authMiddleware,
  adminMiddleware,
  adminController.updateAgentConfig,
);
router.get(
  "/agent-daily",
  authMiddleware.authMiddleware,
  adminMiddleware,
  adminController.getAgentDailyByAdmin,
);
// Server logs
router.get(
  "/logs",
  authMiddleware.authMiddleware,
  adminMiddleware,
  adminController.getServerLogs,
);
// VIP config
router.get(
  "/vip-config",
  authMiddleware.authMiddleware,
  adminMiddleware,
  adminController.getVipConfig,
);
router.put(
  "/vip-config",
  authMiddleware.authMiddleware,
  adminMiddleware,
  adminController.updateVipConfig,
);
// Update user bind bank
router.put(
  "/user/bind-bank",
  authMiddleware.authMiddleware,
  adminMiddleware,
  adminController.adminUpdateBindBank,
);
export default router;
