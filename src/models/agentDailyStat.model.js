import mongoose from "mongoose";

const agentDailyStatSchema = new mongoose.Schema(
  {
    userId: { type: Number, required: true, index: true },
    day: { type: Date, required: true, index: true }, // start of day
    l1Deposit: { type: Number, default: 0 },
    l2Deposit: { type: Number, default: 0 },
    l3Deposit: { type: Number, default: 0 },
    l1Commission: { type: Number, default: 0 },
    l2Commission: { type: Number, default: 0 },
    l3Commission: { type: Number, default: 0 },
    l1Count: { type: Number, default: 0 },
    l2Count: { type: Number, default: 0 },
    l3Count: { type: Number, default: 0 },
  },
  { timestamps: true, versionKey: false },
);

agentDailyStatSchema.index({ userId: 1, day: 1 }, { unique: true });

export default mongoose.model("AgentDailyStat", agentDailyStatSchema);
