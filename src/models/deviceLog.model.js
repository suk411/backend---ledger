import mongoose from "mongoose";

const deviceLogSchema = new mongoose.Schema(
  {
    userId: { type: Number, required: true, index: true },
    ip: { type: String, default: "" },
    ipCountry: { type: String, default: "" },
    ipCity: { type: String, default: "" },
    isp: { type: String, default: "" },
    asn: { type: String, default: "" },
    proxy: { type: Boolean, default: false },
    vpnDetected: { type: Boolean, default: false },
    deviceId: { type: String, default: "", index: true },
    fingerprint: { type: String, default: "", index: true },
    adId: { type: String, default: "", index: true },
    platform: { type: String, default: "" },
    browser: { type: String, default: "" },
    os: { type: String, default: "" },
    screenResolution: { type: String, default: "" },
    deviceMemory: { type: Number, default: 0 },
    paymentMethodHash: { type: String, default: "", index: true },
    riskScore: { type: Number, default: 0, index: true },
    signals: { type: [String], default: [] },
    flagged: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false },
);

deviceLogSchema.index({ userId: 1, createdAt: -1 });
deviceLogSchema.index({ ip: 1 });

export default mongoose.model("DeviceLog", deviceLogSchema);
