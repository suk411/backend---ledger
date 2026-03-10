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
    const prevLevelName = account.vipLevel || "NONE";
    const newTotalDeposits = (account.totalDeposits || 0) + amount;

    // Determine new level by minDeposit ascending
    let newLevel = { name: "NONE", dailyWithdrawLimit: 0, monthlyCheckinBonus: 0, upgradeReward: 0, minDeposit: 0 };
    for (const lvl of levels.sort((a, b) => a.minDeposit - b.minDeposit)) {
      if (newTotalDeposits >= lvl.minDeposit) newLevel = lvl;
    }
    const levelChanged = newLevel.name !== prevLevelName;

    // Base account update
    const update = {
      $inc: { balance: amount, totalDeposits: amount },
    };
    if (levelChanged) {
      update.$set = {
        ...(update.$set || {}),
        vipLevel: newLevel.name,
        vipSince: new Date(),
        withdrawDailyLimit: newLevel.dailyWithdrawLimit,
      };
    }

    // Apply base update
    const updatedAccount = await accountModel.findOneAndUpdate({ user: userId }, update, {
      returnDocument: "after",
      session,
    });

    // If level changed and upgradeReward > 0 -> credit reward
    if (levelChanged && newLevel.upgradeReward > 0) {
      const rewardAmount = newLevel.upgradeReward;
      const afterReward = updatedAccount.balance + rewardAmount;
      await Promise.all([
        accountModel.updateOne(
          { user: userId },
          { $inc: { balance: rewardAmount } },
          { session },
        ),
        transactionLedgerModel.create(
          [
            {
              userId,
              type: "BONUS",
              amount: rewardAmount,
              balanceAfter: afterReward,
              status: "SUCCESS",
              orderId: `VIPUP-${Date.now()}`,
              remark: `VIP upgrade reward to ${newLevel.name}`,
            },
          ],
          { session },
        ),
      ]);
    }

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
