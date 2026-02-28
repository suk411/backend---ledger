import mongoose from "mongoose";
import userModel from "./user.model.js ";
import { required } from "zod/v4-mini";
import { string } from "zod";

const accountSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: [true, "User reference is required"],
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ["active", "inactive", "suspended"],
        message: "Status must be either active, inactive, or suspended",
        default: "active",
      },
    },
    currency: {
      type: String,
      required: [true, "Currency is require to create account"],
      default: "INR",
    },
  },
  { Timestamp: true },
);

accountSchema.index({ user: 1, status: 1 });

const accountModel = mongoose.model("Account", accountSchema);

export default accountModel;
