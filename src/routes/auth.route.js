import express from "express";
import authController from "../controllers/user.auth.controller.js";

const router = express.Router();

// post /api/auth/register
router.post("/register", authController.userRegisterController);

// post /api/auth/login
router.post("/login", authController.userLoginController);

export default router;
