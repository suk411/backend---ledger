import mongoose from "mongoose";

const accountSchema = new mongoose.Schema(
  {
    user: {
      type: Number,
      required: [true, "User reference is required"],
      unique: true,
      sparse: true,
      index: true,
    },

    // VIP fields
    vipLevel: {
      type: String,
      default: "NONE",
      index: true,
    },
    vipSince: {
      type: Date,
      default: null,
    },
    totalDeposits: {
      type: Number,
      default: 0,
      min: [0, "Total deposits cannot be negative"],
      index: true,
    },
    withdrawDailyLimit: {
      type: Number,
      default: 0, // -1 => unlimited, 0 => no limit unlocked
    },
    lastVipBonusAt: {
      type: Date,
      default: null,
    },
    pendingUpgradeBonus: {
      type: Number,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
    statusRemark: {
      type: String,
      default: "",
    },

    balance: {
      type: Number,
      default: 0,
      min: [0, "Balance cannot be negative"],
    },

    currency: {
      type: String,
      required: true,
      default: "INR",
    },
  },
  { timestamps: true },
);

accountSchema.index({ user: 1, status: 1 });

export default mongoose.model("Account", accountSchema);
