import accountModel from "../models/account.model.js";
import DepositOrder from "../models/depositOrder.model.js";
import VipConfig, { ensureDefaultVipConfig } from "../models/vipConfig.model.js";
import transactionLedgerModel from "../models/transactionLedger.model.js";
import mongoose from "mongoose";

async function getUserBalanceController(req, res) {
  try {
    const userId = req.user.userId;

    const account = await accountModel.findOne({ user: userId });

    if (!account) {
      return res.status(404).json({
        status: "failed",
        msg: "Account not found",
      });
    }

    res.status(200).json({
      status: "success",
    
      balance: account.balance,
    });
  } catch (error) {
    res.status(500).json({
      status: "failed",
      msg: error.message,
    });
  }
}

async function getVipStatus(req, res) {
  try {
    const userId = req.user.userId;
    const account = await accountModel.findOne({ user: userId }).select("-__v -createdAt -updatedAt");
    if (!account) {
      return res.status(404).json({ status: "failed", msg: "Account not found" });
    }
    const cfg = await ensureDefaultVipConfig();
    const level = (cfg.levels || []).find((l) => l.name === account.vipLevel) || null;
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${now.getMonth()}`;
    const last = account.lastVipBonusAt ? `${account.lastVipBonusAt.getFullYear()}-${account.lastVipBonusAt.getMonth()}` : null;
    const canClaimMonthly = !!level && monthKey !== last;
    res.json({
      status: "success",
      vipLevel: account.vipLevel,
      vipSince: account.vipSince,
      totalDeposits: account.totalDeposits,
      withdrawDailyLimit: account.withdrawDailyLimit,
      monthlyCheckinBonus: level ? level.monthlyCheckinBonus : 0,
      canClaimMonthly,
      pendingUpgradeBonus: account.pendingUpgradeBonus || 0,
      canClaimUpgrade: (account.pendingUpgradeBonus || 0) > 0,
    });
  } catch (error) {
    res.status(500).json({ status: "failed", msg: error.message });
  }
}

async function claimVipMonthlyBonus(req, res) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const userId = req.user.userId;
    const account = await accountModel.findOne({ user: userId }).session(session);
    if (!account) {
      await session.abortTransaction();
      return res.status(404).json({ status: "failed", msg: "Account not found" });
    }
    const cfg = await ensureDefaultVipConfig();
    const level = (cfg.levels || []).find((l) => l.name === account.vipLevel);
    if (!level) {
      await session.abortTransaction();
      return res.status(400).json({ status: "failed", msg: "No VIP level eligible" });
    }
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${now.getMonth()}`;
    const last = account.lastVipBonusAt ? `${account.lastVipBonusAt.getFullYear()}-${account.lastVipBonusAt.getMonth()}` : null;
    const monthlyEligible = monthKey !== last;
    const monthlyBonus = monthlyEligible ? (level.monthlyCheckinBonus || 0) : 0;
    const upgradeBonus = account.pendingUpgradeBonus || 0;
    const totalBonus = (monthlyBonus || 0) + (upgradeBonus || 0);
    if (totalBonus <= 0) {
      await session.abortTransaction();
      return res.status(400).json({ status: "failed", msg: "No bonus available to claim" });
    }

    // Build ledger entries in sequence
    const entries = [];
    let runningAfter = account.balance;
    if (monthlyBonus > 0) {
      runningAfter += monthlyBonus;
      entries.push({
        userId,
        type: "BONUS",
        amount: monthlyBonus,
        balanceAfter: runningAfter,
        status: "SUCCESS",
        orderId: `VIPMONTH-${now.getFullYear()}${now.getMonth() + 1}-${userId}`,
        remark: `Monthly VIP check-in bonus for ${account.vipLevel}`,
      });
    }
    if (upgradeBonus > 0) {
      runningAfter += upgradeBonus;
      entries.push({
        userId,
        type: "BONUS",
        amount: upgradeBonus,
        balanceAfter: runningAfter,
        status: "SUCCESS",
        orderId: `VIPUP-PACK-${Date.now()}-${userId}`,
        remark: `Accumulated VIP upgrade bonus`,
      });
    }

    const setFields = {};
    if (monthlyEligible) setFields.lastVipBonusAt = now;
    if (upgradeBonus > 0) setFields.pendingUpgradeBonus = 0;

    await Promise.all([
      accountModel.updateOne(
        { user: userId },
        { $inc: { balance: totalBonus }, ...(Object.keys(setFields).length ? { $set: setFields } : {}) },
        { session },
      ),
      // Using insertMany with { ordered: true } to support multiple docs with a session
      (entries.length > 1
        ? transactionLedgerModel.insertMany(entries, { session, ordered: true })
        : transactionLedgerModel.create(entries[0], { session })),
    ]);
    await session.commitTransaction();
    res.json({
      status: "success",
      userId,
      monthlyBonus,
      upgradeBonus,
      totalCredited: totalBonus,
      balanceAfter: runningAfter,
      vipLevel: account.vipLevel,
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ status: "failed", msg: error.message });
  } finally {
    session.endSession();
  }
}

async function getOwnDepositOrders(req, res) {
  try {
    const userId = req.user.userId;
    const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 15));
    const page = Math.max(1, Number(req.query.page) || 1);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      DepositOrder.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("-_id -__v"),
      DepositOrder.countDocuments({ userId }),
    ]);

    res.json({
      status: "success",
      total,
      page,
      limit,
      items,
    });
  } catch (error) {
    res.status(500).json({
      status: "failed",
      msg: error.message,
    });
  }
}

async function adminFindDepositOrders(req, res) {
  try {
    const { orderId, userId } = req.query;
    if (!orderId && !userId) {
      return res
        .status(400)
        .json({ status: "failed", msg: "orderId or userId is required" });
    }

    if (orderId) {
      const order = await DepositOrder.findOne({ orderId }).select("-__v");
      if (!order) {
        return res
          .status(404)
          .json({ status: "failed", msg: "Order not found" });
      }
      return res.json({ status: "success", items: [order] });
    }

    const idNum = Number(userId);
    if (Number.isNaN(idNum)) {
      return res.status(400).json({ status: "failed", msg: "Invalid userId" });
    }
    const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 15));
    const page = Math.max(1, Number(req.query.page) || 1);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      DepositOrder.find({ userId: idNum })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("-__v"),
      DepositOrder.countDocuments({ userId: idNum }),
    ]);

    if (items.length === 0) {
      return res
        .status(404)
        .json({ status: "failed", msg: "No orders found for user" });
    }

    res.json({ status: "success", total, page, limit, items });
  } catch (error) {
    res.status(500).json({
      status: "failed",
      msg: error.message,
    });
  }
}

export default getUserBalanceController;
export { getOwnDepositOrders, adminFindDepositOrders, getVipStatus, claimVipMonthlyBonus };
