import mongoose from "mongoose";

const commissionRecordSchema = new mongoose.Schema(
  {
    recUser: { type: Number, required: true, index: true },
    fromUser: { type: Number, required: true },
    depositAmt: { type: Number, required: true },
    amount: { type: Number, required: true },
    claim: { type: Boolean, default: false, index: true },
    timestamp: { type: Date, default: () => new Date(), index: true },
  },
  { timestamps: true, versionKey: false },
);

commissionRecordSchema.index({ recUser: 1, timestamp: -1 });

export default mongoose.model("CommissionRecord", commissionRecordSchema);
