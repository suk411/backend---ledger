import express from "express";
import adminController from "../controllers/admin.controller.js";
import authMiddleware from "../middleware/user.auth.middleware.js";
import { adminMiddleware } from "../middleware/admin.auth.middleware.js";
const router = express.Router();

// PROTECTED: Admin only
// Post /api/admin/transactions
router.post(
  "/transaction",
  authMiddleware.authMiddleware,
  adminMiddleware,
  adminController.createAdminTransaction,
);

//admin dashboard
// Get /api/admin/dashboard
router.get(
  "/dashboard",
  authMiddleware.authMiddleware,
  adminMiddleware,
  adminController.getAdminDashboard,
);

//Admin fetch ledger of any user
// Get /api/admin/ledger?targetUserId=xxx&limit=50
router.get(
  "/ledger",
  authMiddleware.authMiddleware,
  adminMiddleware,
  adminController.getUserLedgerByAdmin,
);
// Get /api/admin/search?userId=123
router.get(
  "/search",
  authMiddleware.authMiddleware,
  adminMiddleware,
  adminController.searchUserOrAccount,
);
router.get(
  "/transactions",
  authMiddleware.authMiddleware,
  adminMiddleware,
  adminController.getUserTransactionsPaginated,
);
export default router;
