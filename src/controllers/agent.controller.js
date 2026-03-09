import CommissionRecord from "../models/commissionRecord.model.js";
import AgentBonus from "../models/agentBonus.model.js";
import { claimBonus } from "../services/agent.service.js";

async function getUserCommissions(req, res) {
  try {
    const userId = req.user.userId;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 25));
    const claimParam = req.query.claim;
    const filter = { recUser: userId };
    if (typeof claimParam !== "undefined") {
      filter.claim = String(claimParam) === "true";
    }
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      CommissionRecord.find(filter).sort({ timestamp: -1 }).skip(skip).limit(limit),
      CommissionRecord.countDocuments(filter),
    ]);
    res.json({ total, page, limit, items });
  } catch (error) {
    res.status(500).json({ msg: error.message, status: "failed" });
  }
}

async function getBonusSummary(req, res) {
  try {
    const userId = req.user.userId;
    const summary = await AgentBonus.findOne({ userId });
    res.json({
      userId,
      unclaimedBonus: summary?.unclaimedBonus || 0,
      updatedAt: summary?.updatedAt || null,
    });
  } catch (error) {
    res.status(500).json({ msg: error.message, status: "failed" });
  }
}

async function claimBonusController(req, res) {
  try {
    const userId = req.user.userId;
    const { upTo } = req.body || {};
    const result = await claimBonus(userId, upTo || null);
    res.json({
      userId,
      claimedCount: result.claimedCount,
      claimedAmount: result.claimedAmount,
      newBalance: result.newBalance,
      status: "success",
    });
  } catch (error) {
    res.status(500).json({ msg: error.message, status: "failed" });
  }
}

export default { getUserCommissions, getBonusSummary, claimBonusController };
