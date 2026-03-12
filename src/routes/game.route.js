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

export default router;

