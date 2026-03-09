import mongoose from "mongoose";

const agentBonusSchema = new mongoose.Schema(
  {
    userId: { type: Number, required: true, unique: true, index: true },
    unclaimedBonus: { type: Number, default: 0 },
  },
  { timestamps: true, versionKey: false },
);

export default mongoose.model("AgentBonus", agentBonusSchema);
