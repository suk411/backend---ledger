import mongoose from "mongoose";

const agentConfigSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, default: "default" },
    comRates: { type: [Number], default: [0.05, 0.01, 0.005] },
  },
  { timestamps: true, versionKey: false },
);

export default mongoose.model("AgentConfig", agentConfigSchema);
