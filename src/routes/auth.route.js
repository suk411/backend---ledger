import express from "express";
import authController from "../controllers/auth.controller.js";

const router = express.Router();

// post /api/auth/register
router.post("/register", authController.userRegisterController);

export default router;
