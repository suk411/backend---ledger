import mongoose from "mongoose";

const levelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // e.g., VIP 1
    minDeposit: { type: Number, required: true }, // cumulative deposit to unlock
    dailyWithdrawLimit: { type: Number, required: true }, // -1 => unlimited
    monthlyCheckinBonus: { type: Number, required: true },
    upgradeReward: { type: Number, default: 0 },
  },
  { _id: false },
);

const vipConfigSchema = new mongoose.Schema(
  {
    levels: { type: [levelSchema], default: [] },
  },
  { timestamps: true, versionKey: false },
);

const VipConfig = mongoose.model("VipConfig", vipConfigSchema);

async function ensureDefaultVipConfig() {
  const existing = await VipConfig.findOne({});
  if (existing && existing.levels && existing.levels.length) return existing;
  const defaults = [
    { name: "VIP0", minDeposit: 0, dailyWithdrawLimit: 0, monthlyCheckinBonus: 0, upgradeReward: 0 },
    { name: "VIP 1", minDeposit: 200, dailyWithdrawLimit: 500, monthlyCheckinBonus: 160, upgradeReward: 10 },
    { name: "VIP 2", minDeposit: 400, dailyWithdrawLimit: 1000, monthlyCheckinBonus: 160, upgradeReward: 20 },
    { name: "VIP 3", minDeposit: 1000, dailyWithdrawLimit: 2000, monthlyCheckinBonus: 240, upgradeReward: 30 },
    { name: "VIP 4", minDeposit: 2000, dailyWithdrawLimit: 3000, monthlyCheckinBonus: 240, upgradeReward: 40 },
    { name: "SVIP 1", minDeposit: 3000, dailyWithdrawLimit: -1, monthlyCheckinBonus: 400, upgradeReward: 50 },
  ];
  const doc = await VipConfig.create({ levels: defaults });
  return doc;
}

export default VipConfig;
export { ensureDefaultVipConfig };
