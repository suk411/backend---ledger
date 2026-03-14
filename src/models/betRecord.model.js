import mongoose from "mongoose";

const betRecordSchema = new mongoose.Schema(
  {
    member: {
      type: String,
      required: true,
      index: true,
    },
    site: { type: String, required: true },
    product: { type: String, required: true },
    gameId: { type: String, required: true },
    refNo: { type: String, required: true },
    betTime: { type: Date, required: true },
    settleTime: { type: Date, required: true },
    bet: { type: Number, required: true },
    payout: { type: Number, required: true },
    turnover: { type: Number, required: true },
    commission: { type: Number, default: 0 },
    pShare: { type: Number, default: 0 },
    pWin: { type: Number, default: 0 },
    status: { type: Number, required: true },
    remark: { type: String, default: "" },
    raw: { type: Object, default: {} },
  },
  { timestamps: true },
);

betRecordSchema.index({ site: 1, refNo: 1 }, { unique: true });
betRecordSchema.index({ member: 1, settleTime: -1 });

export default mongoose.model("BetRecord", betRecordSchema);

