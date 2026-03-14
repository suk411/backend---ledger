import express from "express";
import gameController from "../controllers/game.controller.js";
import authMiddleware from "../middleware/user.auth.middleware.js";
import adminMiddleware from "../middleware/admin.auth.middleware.js";

const router = express.Router();

// GET /api/game/launch
router.get(
  "/launch",
  authMiddleware.authMiddleware,
  gameController.getLaunchUrl,
);

// POST /api/game/withdraw  -> move all balance from game back to wallet
router.post(
  "/withdraw",
  authMiddleware.authMiddleware,
  gameController.withdrawFromGame,
);

// GET /api/game/balance  -> wallet + game balance for a provider
router.get(
  "/balance",
  authMiddleware.authMiddleware,
  gameController.getBalances,
);

// POST /api/game/sync-bets -> admin only, sync latest bet history from provider
router.post(
  "/sync-bets",
  authMiddleware.authMiddleware,
  adminMiddleware.adminMiddleware,
  gameController.syncBetHistory,
);

// GET /api/game/bets -> user bet history with pagination
router.get(
  "/bets",
  authMiddleware.authMiddleware,
  gameController.getUserBets,
);

export default router;

