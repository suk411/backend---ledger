import accountModel from "../models/account.model.js";
import mongoose from "mongoose";

async function createAccountController(req, res) {
  try {
    const user = req.user;
    if (!user?.userId) {
      return res.status(401).json({
        message: "User not authenticated",
        status: "failed",
      });
    }

    const accountData = {
      user: user.userId, // ✅ Number matches schema
      currency: "INR", // ✅ Required field
    };

    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({
        message: "Database not connected",
        status: "failed",
      });
    }

    const account = await accountModel.create(accountData);

    res.status(201).json({
      account,
      message: "Account created successfully",
      status: "success",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating account",
      status: "failed",
      error: error.message,
    });
  }
}

export default { createAccountController };
