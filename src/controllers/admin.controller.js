import accountModel from "../models/account.model.js";
import transactionLedgerModel from "../models/transactionLedger.model.js";
import userModel from "../models/user.model.js";
import DepositOrder from "../models/depositOrder.model.js";
import { deposit } from "./wallet.controller.js";
import AgentConfig from "../models/agentConfig.model.js";
import { setCommissionRates, getCommissionRates } from "../services/agent.service.js";

//Admin create transaction for any user

async function createAdminTransaction(req, res) {
  const { targetUserId, type, amount, remark = "" } = req.body;

  try {
    const account = await accountModel.findOne({ user: targetUserId });
    if (!account) {
      return res.status(404).json({ msg: "Target user account not found" });
    }

    // Calculate new balance based on transaction type
    const newBalance =
      account.balance +
      (["DEPOSIT", "WIN", "BONUS"].includes(type) ? amount : -amount);
    // Update balance + ledger
    await accountModel.updateOne(
      { user: targetUserId },
      { balance: newBalance },
    );
    const ledger = await transactionLedgerModel.create({
      userId: targetUserId,
      type,
      amount: Math.abs(amount),
      balanceAfter: newBalance,
      status: "SUCCESS",
      orderId: `ADMIN${Date.now()}`,
      remark: remark || `${type} by Admin`,
    });

    res.json({
      msg: "Transaction created",
      targetUserId,
      type,
      amount,
      newBalance,
      orderId: ledger.orderId,
    });
  } catch (error) {
    res.status(500).json({ msg: error.msg });
  }
}

//admin dashboard

async function getAdminDashboard(req, res) {
  try {
    const [totalUsers, deposits] = await Promise.all([
      accountModel.countDocuments(),
      DepositOrder.aggregate([
        { $match: { status: "SUCCESS" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
    ]);
    res.json({
      totalUsers,
      totalDeposits: deposits[0]?.total || 0,
    });
  } catch (error) {
    res.status(500).json({
      msg: "Error fetching admin dashboard data",
      status: "failed",
      error: error.message,
    });
  }
}

// Admin fetch ledger of any user
async function getUserLedgerByAdmin(req, res) {
  const { targetUserId, limit = 50 } = req.query;
  try {
    const ledger = await transactionLedgerModel
      .find({ userId: targetUserId })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .select("-_id -__v");
    if (!ledger || ledger.length === 0) {
      return res
        .status(404)
        .json({ msg: "No transactions found for this user" });
    }
    res.json({ targetUserId, transactions: ledger });
  } catch (error) {
    res.status(500).json({ msg: error.msg });
  }
}

async function searchUserOrAccount(req, res) {
  const { userId } = req.query;
  const idNum = Number(userId);
  if (!userId || Number.isNaN(idNum)) {
    return res.status(400).json({ msg: "Invalid or missing userId" });
  }
  try {
    const [user, account] = await Promise.all([
      userModel.findOne({ userId: idNum }).select("-password -__v"),
      accountModel.findOne({ user: idNum }).select("-__v"),
    ]);
    if (!user && !account) {
      return res.status(404).json({ msg: "User or account not found" });
    }
    res.json({
      user: user
        ? {
            userId: user.userId,
            mobile: user.mobile,
            admin: user.admin,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          }
        : null,
      account,
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
}

async function getAdminDepositOrders(req, res) {
  const { orderId, userId, page = 1, limit = 25 } = req.query;
  try {
    if (!orderId && !userId) {
      return res
        .status(400)
        .json({ status: "failed", msg: "orderId or userId is required" });
    }
    if (orderId) {
      const order = await DepositOrder.findOne({ orderId }).select("-__v");
      if (!order) {
        return res.status(404).json({ status: "failed", msg: "Order not found" });
      }
      return res.json({ status: "success", items: [order] });
    }
    const idNum = Number(userId);
    if (Number.isNaN(idNum)) {
      return res.status(400).json({ status: "failed", msg: "Invalid userId" });
    }
    const lm = Math.max(1, Math.min(100, Number(limit) || 25));
    const pg = Math.max(1, Number(page) || 1);
    const skip = (pg - 1) * lm;
    const [items, total] = await Promise.all([
      DepositOrder.find({ userId: idNum })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(lm)
        .select("-__v"),
      DepositOrder.countDocuments({ userId: idNum }),
    ]);
    if (items.length === 0) {
      return res
        .status(404)
        .json({ status: "failed", msg: "No orders found for user" });
    }
    res.json({ status: "success", userId: idNum, total, page: pg, limit: lm, items });
  } catch (error) {
    res.status(500).json({ status: "failed", msg: error.message });
  }
}

async function getUserTransactionsPaginated(req, res) {
  const { userId, page = 1, limit = 25 } = req.query;
  const idNum = Number(userId);
  const pg = Math.max(1, Number(page) || 1);
  const lm = Math.max(1, Math.min(100, Number(limit) || 25));
  if (!userId || Number.isNaN(idNum)) {
    return res.status(400).json({ msg: "Invalid or missing userId" });
  }
  try {
    const skip = (pg - 1) * lm;
    const [items, total] = await Promise.all([
      transactionLedgerModel
        .find({ userId: idNum })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(lm)
        .select("-_id -__v"),
      transactionLedgerModel.countDocuments({ userId: idNum }),
    ]);
    if (!items || items.length === 0) {
      return res.status(404).json({ msg: "No transactions found for this user" });
    }
    res.json({ userId: idNum, total, page: pg, limit: lm, items });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
}

async function getAgentReferralStatsAdmin(req, res) {
  try {
    const { userId, page = 1, limit = 50 } = req.query;
    const idNum = Number(userId);
    if (!userId || Number.isNaN(idNum)) {
      return res.status(400).json({ msg: "Invalid or missing userId" });
    }

    const agent = await userModel
      .findOne({ userId: idNum })
      .select("userId mobile admin referredBy createdAt");
    if (!agent) {
      return res.status(404).json({ msg: "Agent user not found" });
    }

    const inviter = agent.referredBy
      ? await userModel
          .findOne({ userId: agent.referredBy })
          .select("userId mobile createdAt")
      : null;

    const lm = Math.max(1, Math.min(100, Number(limit) || 50));
    const pg = Math.max(1, Number(page) || 1);
    const skip = (pg - 1) * lm;

    const [invitees, totalInvitees] = await Promise.all([
      userModel
        .find({ referredBy: idNum })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(lm)
        .select("userId mobile createdAt"),
      userModel.countDocuments({ referredBy: idNum }),
    ]);

    const inviteeIds = invitees.map((u) => u.userId);
    let totalsByUser = {};
    if (inviteeIds.length > 0) {
      const sums = await transactionLedgerModel.aggregate([
        { $match: { userId: { $in: inviteeIds }, type: { $in: ["DEPOSIT", "WITHDRAW"] } } },
        {
          $group: {
            _id: { userId: "$userId", type: "$type" },
            total: { $sum: "$amount" },
          },
        },
      ]);
      for (const row of sums) {
        const uid = row._id.userId;
        const t = row._id.type;
        if (!totalsByUser[uid]) totalsByUser[uid] = { deposit: 0, withdraw: 0 };
        if (t === "DEPOSIT") totalsByUser[uid].deposit += row.total;
        if (t === "WITHDRAW") totalsByUser[uid].withdraw += row.total;
      }
    }

    const items = invitees.map((u) => ({
      userId: u.userId,
      mobile: u.mobile,
      createdAt: u.createdAt,
      totals: totalsByUser[u.userId] || { deposit: 0, withdraw: 0 },
    }));

    res.json({
      agent: {
        userId: agent.userId,
        mobile: agent.mobile,
        admin: agent.admin,
        referredBy: agent.referredBy || null,
        createdAt: agent.createdAt,
      },
      inviter: inviter
        ? { userId: inviter.userId, mobile: inviter.mobile, createdAt: inviter.createdAt }
        : null,
      totalInvitees,
      page: pg,
      limit: lm,
      invitees: items,
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
}

async function approveDepositOrder(req, res) {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ msg: "orderId is required" });
    }
    const order = await DepositOrder.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ msg: "Order not found" });
    }
    if (order.status === "SUCCESS") {
      return res.json({ msg: "Already approved", orderId, status: order.status });
    }
    await deposit(order.userId, order.amount, order.orderId, "Admin approved deposit");
    order.status = "SUCCESS";
    await order.save();
    res.json({
      msg: "Deposit approved",
      orderId: order.orderId,
      userId: order.userId,
      amount: order.amount,
      status: order.status,
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
}

async function getAgentConfig(req, res) {
  try {
    const rates = await getCommissionRates();
    res.json({ comRates: rates });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
}

async function updateAgentConfig(req, res) {
  try {
    const { comRates } = req.body || {};
    if (!Array.isArray(comRates) || comRates.length !== 3) {
      return res.status(400).json({ msg: "comRates must be an array of three numbers" });
    }
    const updated = await setCommissionRates(comRates.map((n) => Number(n)));
    res.json({ msg: "Updated", comRates: updated });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
}

async function updateUserStatusAdmin(req, res) {
  try {
    const { userId, status, remark = "" } = req.body || {};
    const idNum = Number(userId);
    if (!userId || Number.isNaN(idNum)) {
      return res.status(400).json({ msg: "Invalid or missing userId" });
    }
    if (!status) {
      return res.status(400).json({ msg: "Missing status" });
    }
    const normalized =
      String(status).toLowerCase() === "active"
        ? "active"
        : String(status).toLowerCase() === "suspended"
          ? "suspended"
          : ["ban", "banned", "inactive"].includes(String(status).toLowerCase())
            ? "inactive"
            : null;
    if (!normalized) {
      return res.status(400).json({ msg: "Invalid status" });
    }
    const account = await accountModel.findOneAndUpdate(
      { user: idNum },
      { $set: { status: normalized, statusRemark: String(remark) } },
      { returnDocument: "after" },
    );
    if (!account) {
      return res.status(404).json({ msg: "Account not found" });
    }
    res.json({
      msg: "Status updated",
      userId: idNum,
      status: account.status,
      statusRemark: account.statusRemark,
      updatedAt: account.updatedAt,
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
}

export default {
  createAdminTransaction,
  getAdminDashboard,
  getUserLedgerByAdmin,
  searchUserOrAccount,
  getAdminDepositOrders,
  getUserTransactionsPaginated,
  getAgentReferralStatsAdmin,
  approveDepositOrder,
  getAgentConfig,
  updateAgentConfig,
  updateUserStatusAdmin,
};
