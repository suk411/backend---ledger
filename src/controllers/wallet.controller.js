import mongoose from "mongoose";
import accountModel from "../models/account.model.js";
import transactionLedgerModel from "../models/transactionLedger.model.js";
import VipConfig, { ensureDefaultVipConfig } from "../models/vipConfig.model.js";

async function deposit(userId, amount, orderId, remark = "Deposit") {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const account = await accountModel.findOne({ user: userId }).session(session);
    if (!account) throw new Error("Account not found");
    const newBalance = account.balance + amount;

    // Create deposit ledger first
    await transactionLedgerModel.create(
      [
        {
          userId,
          type: "DEPOSIT",
          amount,
          balanceAfter: newBalance,
          status: "SUCCESS",
          orderId,
          remark,
        },
      ],
      { session },
    );

    // Load VIP config
    const config = await ensureDefaultVipConfig();
    const levels = (config && config.levels) || [];
    const prevLevelName = account.vipLevel || "VIP0";
    const newTotalDeposits = (account.totalDeposits || 0) + amount;

    // Determine new level by minDeposit ascending
    let newLevel = { name: "VIP0", dailyWithdrawLimit: 0, monthlyCheckinBonus: 0, upgradeReward: 0, minDeposit: 0 };
    const sortedLevels = [...levels].sort((a, b) => a.minDeposit - b.minDeposit);
    for (const lvl of sortedLevels) {
      if (newTotalDeposits >= lvl.minDeposit) newLevel = lvl;
    }
    const levelChanged = newLevel.name !== prevLevelName;

    // Compute accumulated upgrade rewards for all crossed levels
    const prevIdx = sortedLevels.findIndex((l) => l.name === prevLevelName);
    const newIdx = sortedLevels.findIndex((l) => l.name === newLevel.name);
    let crossedReward = 0;
    if (newIdx > prevIdx) {
      for (let i = Math.max(prevIdx + 1, 0); i <= newIdx; i++) {
        crossedReward += Number(sortedLevels[i].upgradeReward || 0);
      }
    }

    // Base account update
    const update = {
      $inc: { balance: amount, totalDeposits: amount, ...(crossedReward > 0 ? { pendingUpgradeBonus: crossedReward } : {}) },
    };
    if (levelChanged) {
      update.$set = {
        ...(update.$set || {}),
        vipLevel: newLevel.name,
        vipSince: new Date(),
        withdrawDailyLimit: newLevel.dailyWithdrawLimit,
      };
    }

    // Apply update
    const updatedAccount = await accountModel.findOneAndUpdate({ user: userId }, update, {
      returnDocument: "after",
      session,
    });

    await session.commitTransaction();
    return updatedAccount;
  } catch (e) {
    await session.abortTransaction();
    throw e;
  } finally {
    session.endSession();
  }
}

export { deposit };
