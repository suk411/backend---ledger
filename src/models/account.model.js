import mongoose from "mongoose";

const accountSchema = new mongoose.Schema(
  {
    user: {
      type: Number, // ✅ Number to match user.userId
      required: [true, "User reference is required"],
      index: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
    balance: {
      type: Number,
      default: 0,
      min: [0, "Balance cannot be negative"],
    },
    currency: {
      type: String,
      required: [true, "Currency is required to create account"],
      default: "INR",
    },
  },
  { timestamps: true }, // ✅ Fixed: timestamps (not timestamp)
);

accountSchema.index({ userId: 1, status: 1 });
export default mongoose.model("Account", accountSchema);
