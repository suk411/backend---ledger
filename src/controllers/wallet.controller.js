import mongoose from "mongoose";
import accountModel from "../models/account.model.js";
import transactionLedgerModel from "../models/transactionLedger.model.js";

async function deposit(userId, amount, orderId, remark = "Deposit") {
  // Atomic transaction: Balance + Ledger must succeed together
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Step 1: Read current balance
    const account = await accountModel
      .findOne({ user: userId })
      .session(session);
    if (!account) throw new Error("Account not found");

    const newBalance = account.balance + amount;

    // Step 2: Update balance + Create ledger (ATOMIC)
    const [updatedAccount, ledger] = await Promise.all([
      accountModel.findOneAndUpdate(
        { user: userId },
        { $inc: { balance: amount } },
        { returnDocument: "after", session },
      ),
      transactionLedgerModel.create(
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
      ),
    ]);

    await session.commitTransaction();
    return { account: updatedAccount, ledger };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

async function withdraw(userId, amount, orderId, remark = "Withdrawal") {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const account = await accountModel
      .findOne({ user: userId })
      .session(session);
    if (!account || account.balance < amount) {
      throw new Error("Insufficient balance");
    }

    const newBalance = account.balance - amount;

    const [updatedAccount, ledger] = await Promise.all([
      accountModel.findOneAndUpdate(
        { user: userId, balance: { $gte: amount } }, // Atomic check
        { $inc: { balance: -amount } },
        { returnDocument: "after", session },
      ),
      transactionLedgerModel.create(
        [
          {
            userId,
            type: "WITHDRAW",
            amount,
            balanceAfter: newBalance,
            status: "PENDING", // Changes to SUCCESS later
            orderId,
            remark,
          },
        ],
        { session },
      ),
    ]);

    await session.commitTransaction();
    return { account: updatedAccount, ledger };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

async function getBalance(userId) {
  const account = await accountModel.findOne({ user: userId });
  return account ? account.balance : 0;
}

async function getLedger(userId, limit = 50) {
  return await transactionLedgerModel
    .find({ userId }) // only this user's transactions
    .sort({ createdAt: -1 }) // newest first
    .limit(limit) // limit results
    .select("-_id -__v"); // exclude _id and __v
}

export { deposit, withdraw, getBalance, getLedger };
