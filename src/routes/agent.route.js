import express from "express";
import authMiddleware from "../middleware/user.auth.middleware.js";
import agentController from "../controllers/agent.controller.js";

const router = express.Router();

router.use(authMiddleware.authMiddleware);

router.get("/commissions", agentController.getUserCommissions);
router.get("/bonus/summary", agentController.getBonusSummary);
router.post("/bonus/claim", agentController.claimBonusController);
router.get("/bonus/daily", agentController.getDailyStats);

export default router;
