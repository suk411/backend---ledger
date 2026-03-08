import mongoose from "mongoose";
import accountModel from "../models/account.model.js";
import transactionLedgerModel from "../models/transactionLedger.model.js";

async function deposit(userId, amount, orderId, remark = "Deposit") {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const account = await accountModel.findOne({ user: userId }).session(session);
    if (!account) throw new Error("Account not found");
    const newBalance = account.balance + amount;
    const [updatedAccount] = await Promise.all([
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
    return updatedAccount;
  } catch (e) {
    await session.abortTransaction();
    throw e;
  } finally {
    session.endSession();
  }
}

export { deposit };
