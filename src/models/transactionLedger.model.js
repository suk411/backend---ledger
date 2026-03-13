import mongoose from "mongoose";

const transactionLedgerSchema = new mongoose.Schema(
  {
    userId: {
      type: Number,
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        "DEPOSIT",
        "WITHDRAW",
        "BET",
        "WIN",
        "REFUND",
        "BONUS",
        "ADMIN",
        "gameIn",
        "gameOut",
      ],
    },
    amount: {
      type: Number,
      required: true,
    },
    balanceAfter: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED"],
      default: "PENDING",
    },
    orderId: {
      type: String,
      required: function () {
        return this.type === "DEPOSIT" || this.type === "WITHDRAW";
      },
    },
    remark: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

// Fast history queries
transactionLedgerSchema.index({ userId: 1, createdAt: -1 });
transactionLedgerSchema.index({ userId: 1, type: 1 });

export default mongoose.model("TransactionLedger", transactionLedgerSchema);
