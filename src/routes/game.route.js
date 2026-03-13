import express from "express";
import gameController from "../controllers/game.controller.js";
import authMiddleware from "../middleware/user.auth.middleware.js";

const router = express.Router();

// GET /api/game/launch?gameId=302&type=SL
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

export default router;

