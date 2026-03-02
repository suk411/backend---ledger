import accountModel from "../models/account.model.js";
import transactionLedgerModel from "../models/transactionLedger.model.js";

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
    const totalUsers = await accountModel.countDocuments();
    const totalBalance = await accountModel.aggregate([
      { $group: { userId: null, total: { $sum: "$balance" } } },
    ]);

    res.json({
      totalUsers,
      totalBalance: totalBalance[0]?.total || 0,
    });
  } catch (error) {
    res.status(500).json({
      msg: "Error fetching admin dashboard data",
      status: "failed",
      error: error.msg,
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

export default {
  createAdminTransaction,
  getAdminDashboard,
  getUserLedgerByAdmin,
};
