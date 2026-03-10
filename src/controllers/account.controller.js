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
    if (monthKey === last) {
      await session.abortTransaction();
      return res.status(400).json({ status: "failed", msg: "Monthly check-in bonus already claimed" });
    }
    const bonus = level.monthlyCheckinBonus || 0;
    const after = account.balance + bonus;
    await Promise.all([
      accountModel.updateOne(
        { user: userId },
        { $inc: { balance: bonus }, $set: { lastVipBonusAt: now } },
        { session },
      ),
      transactionLedgerModel.create(
        [
          {
            userId,
            type: "BONUS",
            amount: bonus,
            balanceAfter: after,
            status: "SUCCESS",
            orderId: `VIPMONTH-${now.getFullYear()}${now.getMonth() + 1}-${userId}`,
            remark: `Monthly VIP check-in bonus for ${account.vipLevel}`,
          },
        ],
        { session },
      ),
    ]);
    await session.commitTransaction();
    res.json({ status: "success", userId, amount: bonus, balanceAfter: after, vipLevel: account.vipLevel });
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
