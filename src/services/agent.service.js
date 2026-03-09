import AgentConfig from "../models/agentConfig.model.js";
import userModel from "../models/user.model.js";
import CommissionRecord from "../models/commissionRecord.model.js";
import AgentBonus from "../models/agentBonus.model.js";
import mongoose from "mongoose";
import accountModel from "../models/account.model.js";
import transactionLedgerModel from "../models/transactionLedger.model.js";

export async function getCommissionRates() {
  let cfg = await AgentConfig.findOne({ key: "default" });
  if (!cfg) {
    cfg = await AgentConfig.create({ key: "default", comRates: [0.05, 0.01, 0.005] });
  }
  return cfg.comRates || [0.05, 0.01, 0.005];
}

export async function setCommissionRates(comRates) {
  const cfg = await AgentConfig.findOneAndUpdate(
    { key: "default" },
    { comRates },
    { upsert: true, returnDocument: "after" },
  );
  return cfg.comRates;
}

export async function awardDepositCommission(depositUserId, depositAmount) {
  const [rates, user] = await Promise.all([
    getCommissionRates(),
    userModel.findOne({ userId: depositUserId }).select("path"),
  ]);
  if (!user) return;
  const path = Array.isArray(user.path) ? user.path : [];
  const now = new Date();
  const ops = [];
  for (let i = 0; i < Math.min(3, path.length); i++) {
    const recUser = path[i];
    const rate = rates[i] ?? 0;
    if (recUser && rate > 0) {
      const amount = Number((depositAmount * rate).toFixed(2));
      if (amount > 0) {
        ops.push(
          CommissionRecord.create({
            recUser,
            fromUser: depositUserId,
            depositAmt: depositAmount,
            amount,
            claim: false,
            timestamp: now,
          }),
        );
        ops.push(
          AgentBonus.findOneAndUpdate(
            { userId: recUser },
            { $inc: { unclaimedBonus: amount } },
            { upsert: true },
          ),
        );
      }
    }
  }
  if (ops.length > 0) {
    await Promise.all(ops);
  }
}

export async function claimBonus(userId, upTo = null) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const q = { recUser: userId, claim: false };
    if (upTo) q.timestamp = { $lte: new Date(upTo) };
    const items = await CommissionRecord.find(q).session(session);
    if (!items.length) {
      await session.abortTransaction();
      return { claimedCount: 0, claimedAmount: 0 };
    }
    const amount = items.reduce((sum, r) => sum + r.amount, 0);
    await CommissionRecord.updateMany(q, { $set: { claim: true } }).session(session);

    const account = await accountModel.findOne({ user: userId }).session(session);
    if (!account) throw new Error("Account not found");
    const newBalance = account.balance + amount;
    await accountModel
      .updateOne({ user: userId }, { $inc: { balance: amount } })
      .session(session);
    await transactionLedgerModel.create(
      [
        {
          userId,
          type: "BONUS",
          amount,
          balanceAfter: newBalance,
          status: "SUCCESS",
          remark: "agent_bonus",
        },
      ],
      { session },
    );
    await AgentBonus.updateOne(
      { userId },
      { $inc: { unclaimedBonus: -amount } },
      { upsert: true, session },
    );

    await session.commitTransaction();
    return { claimedCount: items.length, claimedAmount: amount, newBalance };
  } catch (e) {
    await session.abortTransaction();
    throw e;
  } finally {
    session.endSession();
  }
}
