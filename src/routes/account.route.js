import express from "express";
import getUserBalanceController from "../controllers/account.controller.js";
import authMiddleware from "../middleware/user.auth.middleware.js";

const router = express.Router();
// GET  /api/account/balance
router.get("/balance", authMiddleware.authMiddleware, getUserBalanceController);

export default router;
