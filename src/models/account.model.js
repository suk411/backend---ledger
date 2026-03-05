import mongoose from "mongoose";

const accountSchema = new mongoose.Schema(
  {
    user: {
      type: Number,
      required: [true, "User reference is required"],
      unique: true,
      sparse: true,
      index: true,
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
      required: true,
      default: "INR",
    },
  },
  { timestamps: true },
);

accountSchema.index({ user: 1, status: 1 });

export default mongoose.model("Account", accountSchema);
