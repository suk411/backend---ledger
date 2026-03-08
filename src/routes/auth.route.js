import express from "express";
import authController from "../controllers/user.auth.controller.js";
import authMiddleware from "../middleware/user.auth.middleware.js";

const router = express.Router();

// post /api/auth/register
router.post("/register", authController.userRegisterController);

// post /api/auth/login
router.post("/login", authController.userLoginController);

// get /api/auth/referrals
router.get(
  "/referrals",
  authMiddleware.authMiddleware,
  authController.getReferralStats,
);

export default router;
