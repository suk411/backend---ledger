import mongoose from "mongoose";

const betRecordSchema = new mongoose.Schema(
  {
    // Local userId (parsed from provider member u<userId>)
    userId: {
      type: Number,
      index: true,
      required: true,
    },
    // Provider fields (from standardized report)
    site: { type: String, required: true }, // provider code
    product: { type: String, required: true }, // game type code
    member: { type: String, required: true }, // username at provider
    gameId: { type: String, required: true },
    refNo: { type: String, required: true }, // provider bet id
    betTime: { type: Date, required: true },
    settleTime: { type: Date, required: true },
    bet: { type: Number, required: true },
    payout: { type: Number, required: true },
    turnover: { type: Number, required: true },
    commission: { type: Number, default: 0 },
    pShare: { type: Number, default: 0 },
    pWin: { type: Number, default: 0 },
    status: { type: Number, required: true }, // 1 valid, 0 running, -1 invalid
    remark: { type: String, default: "" },
    raw: { type: Object, default: {} },
  },
  { timestamps: true },
);

// Avoid duplicates: one record per provider bet id
betRecordSchema.index({ site: 1, refNo: 1 }, { unique: true });
betRecordSchema.index({ userId: 1, settleTime: -1 });

export default mongoose.model("BetRecord", betRecordSchema);

