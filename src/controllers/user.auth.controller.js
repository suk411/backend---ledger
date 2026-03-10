import userModel, { generateUserId } from "../models/user.model.js";
import accountModel from "../models/account.model.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import DeviceLog from "../models/deviceLog.model.js";

// ================= REGISTER =================

async function userRegisterController(req, res) {
  const { mobile, password, referralCode } = req.body;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Check if user already exists
    const existingUser = await userModel.findOne({ mobile }).session(session);

    if (existingUser) {
      await session.abortTransaction();
      return res.status(400).json({
        msg: "User already exists",
        status: "failed",
      });
    }

    // Generate userId atomically within transaction
    const userId = await generateUserId(session);

    let referredBy = null;
    let newPath = [];
    if (referralCode) {
      const inviterId = Number(referralCode);
      if (!Number.isNaN(inviterId)) {
        const inviter = await userModel.findOne({ userId: inviterId }).session(session);
        if (inviter) {
          referredBy = inviter.userId;
          const inviterPath = Array.isArray(inviter.path) ? inviter.path : [];
          // Build as [...inviter.path, inviter.userId], last = direct inviter
          newPath = [...inviterPath, inviter.userId].slice(-3);
        }
      }
    }

    // Create user with generated userId
    const newUser = await userModel.create(
      [
        {
          userId,
          mobile,
          password,
          inviteCode: String(userId),
          referredBy,
          path: newPath,
        },
      ],
      { session },
    );

    if (!newUser || !newUser[0]) {
      throw new Error("Failed to create user");
    }

    console.log("USER CREATED:", newUser[0].userId);

    // Create account with same userId in same transaction
    const account = await accountModel.create(
      [
        {
          user: userId,
          balance: 0,
          currency: "INR",
          status: "active",
        },
      ],
      { session },
    );

    if (!account || !account[0]) {
      throw new Error("Failed to create account");
    }

    console.log("ACCOUNT CREATED:", account[0].user);

    const device = req.body.device || {};
    const network = req.body.network || {};
    const paymentMethodHash = req.body.paymentMethodHash || "";

    const sameDevice = device.deviceId ? await DeviceLog.countDocuments({ deviceId: device.deviceId }) : 0;
    const samePayment = paymentMethodHash ? await DeviceLog.countDocuments({ paymentMethodHash }) : 0;
    const sameFingerprint = device.fingerprint ? await DeviceLog.countDocuments({ fingerprint: device.fingerprint }) : 0;
    const sameIp = network.ip ? await DeviceLog.countDocuments({ ip: network.ip }) : 0;
    let riskScore = 0;
    const signals = [];
    if (sameDevice > 0) {
      riskScore += 70;
      signals.push("same_deviceId");
    }
    if (samePayment > 0) {
      riskScore += 70;
      signals.push("same_payment");
    }
    if (sameFingerprint > 0) {
      riskScore += 30;
      signals.push("same_fingerprint");
    }
    if (sameIp > 0) {
      riskScore += 10;
      signals.push("same_ip");
    }
    if (network.proxy || network.vpnDetected) {
      riskScore += 20;
      signals.push("proxy_or_vpn");
    }
    const flagged = riskScore > 80;

    await DeviceLog.create(
      [
        {
          userId,
          ip: network.ip || "",
          ipCountry: network.ipCountry || "",
          ipCity: network.ipCity || "",
          isp: network.isp || "",
          asn: network.asn || "",
          proxy: !!network.proxy,
          vpnDetected: !!network.vpnDetected,
          deviceId: device.deviceId || "",
          fingerprint: device.fingerprint || "",
          platform: device.platform || "",
          browser: device.browser || "",
          os: device.os || "",
          screenResolution: device.screenResolution || "",
          deviceMemory: Number(device.deviceMemory || 0),
          paymentMethodHash: paymentMethodHash || "",
          riskScore,
          signals,
          flagged,
        },
      ],
      { session },
    );

    await session.commitTransaction()

    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      user: { id: userId, admin: false, inviteCode: String(userId), referredBy },
      msg: "Register success",
      status: "success",
      token,
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({
      msg: "Error registering user",
      status: "failed",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
}

// ================= LOGIN =================

async function userLoginController(req, res) {
  const { mobile, password } = req.body;

  try {
    const user = await userModel.findOne({ mobile }).select("+password");

    if (!user) {
      return res.status(404).json({
        msg: "User not found",
        status: "failed",
      });
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        msg: "Invalid password",
        status: "failed",
      });
    }

    const token = jwt.sign({ userId: user.userId }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      user: { id: user.userId, admin: user.admin },
      msg: "Login success",
      status: "success",
      token,
    });
  } catch (error) {
    res.status(500).json({
      msg: "Login error",
      status: "failed",
      error: error.message,
    });
  }
}

async function getReferralStats(req, res) {
  try {
    const currentId = req.user.userId;
    const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 20));
    const page = Math.max(1, Number(req.query.page) || 1);
    const skip = (page - 1) * limit;
    const [total, users] = await Promise.all([
      userModel.countDocuments({ referredBy: currentId }),
      userModel
        .find({ referredBy: currentId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("userId mobile createdAt"),
    ]);
    const inviteCode = String(currentId);
    const inviteLink = `https://1xking.vercel.app/register?ref=${inviteCode}`;
    res.json({
      status: "success",
      inviteCode,
      inviteLink,
      total,
      page,
      limit,
      users,
    });
  } catch (error) {
    res.status(500).json({ status: "failed", msg: error.message });
  }
}

export default { userRegisterController, userLoginController, getReferralStats };
