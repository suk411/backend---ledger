import mongoose from "mongoose";

const depositOrderSchema = new mongoose.Schema(
  {
    orderId: { type: String, unique: true, index: true },
    userId: { type: Number, required: true, index: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED", "REFUNDED", "EXPIRED"],
      default: "PENDING",
      index: true,
    },
    gatewayOrderNo: { type: String },
    paymentLinks: { type: Object, default: {} },
    channelName: { type: String, default: "Paysimply" },
    note: { type: String },
  },
  { timestamps: true, versionKey: false },
);

export default mongoose.model("DepositOrder", depositOrderSchema);
