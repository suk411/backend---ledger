import DepositOrder from "../models/depositOrder.model.js";
import {
  createPaymentOrder,
  verifyCallbackSign,
} from "../services/paysimply.service.js";
import accountModel from "../models/account.model.js";
import { deposit } from "./wallet.controller.js";

function mapGatewayStatus(status) {
  if ([0, 1, -4].includes(status)) return "PENDING";
  if ([2, 3].includes(status)) return "SUCCESS";
  if ([-1, -2].includes(status)) return "FAILED";
  if (status === -3) return "REFUNDED";
  return "EXPIRED";
}

async function initiateDeposit(req, res) {
  try {
    const { userId, amount } = req.body;
    console.log("🌐 POST /api/payment/deposit");

    // ✅ Check account
    const account = await accountModel.findOne({ user: req.user.userId });
    if (!account) {
      return res.status(404).json({
        success: false,
        msg: "User account not found",
        status: "failed",
      });
    }

    const merOrderNo = `MER${Date.now()}${req.user.userId}`;
    console.log(
      `➡️ Initiating deposit: userId=${req.user.userId}, amount=${amount}, merOrderNo=${merOrderNo}`,
    );

    // ✅ Call Paysimply (WORKING!)
    const gatewayRes = await createPaymentOrder({
      merOrderNo,
      amount,
      user: {
        userId: req.user.userId,
        name: req.user.name,
        email: req.user.email,
        mobileNumber: req.user.mobileNumber,
      },
    });

    if (gatewayRes.code !== 0) {
      throw new Error(`Gateway error: ${gatewayRes.msg || "Unknown error"}`);
    }

    const gwData = gatewayRes.data;
    console.log("✅ Gateway response:", {
      orderNo: gwData.orderNo,
      status: gwData.orderStatus,
      paymentLink: gwData.params?.paymentLink,
    });

    // ✅ FIXED CastError: Safe Number conversion
    const finalUserId = Number(userId || req.user.userId);
    if (isNaN(finalUserId)) {
      throw new Error("Invalid user ID");
    }

    // ✅ Create order (NO MORE CastError!)
    const order = await DepositOrder.create({
      orderId: merOrderNo,
      userId: finalUserId,
      amount: gwData.amount || amount,
      currency: gwData.currency || "INR",
      status: mapGatewayStatus(gwData.orderStatus),
      gatewayOrderNo: gwData.orderNo,
      paymentLinks: gwData.params,
      channelName: "simplyPay",
    });

    console.log("✅ Deposit order created:", order.orderId);

    res.json({
      success: true,
      paymentUrl: gwData.params?.paymentLink,

      merOrderNo: order.orderId,

      amount: order.amount,
      currency: order.currency,
      status: order.status,
      msg: "Redirect to paymentUrl",
    });
  } catch (err) {
    console.error("❌ Error in initiateDeposit:", err.message);
    res.status(500).json({
      success: false,
      msg: err.message.includes("userId")
        ? "Invalid user ID"
        : "Error initiating deposit",
      status: "failed",
    });
  }
}

async function paymentCallback(req, res) {
  try {
    const body = req.body;
    console.log(
      `➡️ Callback: merOrderNo=${body.merOrderNo || body.data?.merOrderNo}`,
    );

    if (body.code !== 0) {
      return res
        .status(400)
        .json({ success: false, msg: "Invalid callback", status: "failed" });
    }

    if (!verifyCallbackSign(body)) {
      return res
        .status(401)
        .json({ success: false, msg: "Signature mismatch", status: "failed" });
    }

    const gwData = body.data;
    const merOrderNo = body.merOrderNo || gwData?.merOrderNo;

    const order = await DepositOrder.findOne({ orderId: merOrderNo });
    if (!order) {
      return res
        .status(404)
        .json({ success: false, msg: "Order not found", status: "failed" });
    }

    const newStatus = mapGatewayStatus(gwData.orderStatus);
    if (order.status !== newStatus) {
      order.status = newStatus;
      await order.save();

      if (newStatus === "SUCCESS") {
        await deposit(
          order.userId,
          order.amount,
          order.orderId,
          "Deposit via Paysimply",
        );
        console.log(`✅ Credited ${order.userId}: ₹${order.amount}`);
      }
    }

    res.status(200).type("text").send("success");
  } catch (err) {
    console.error("❌ Callback error:", err.message);
    res
      .status(500)
      .json({ success: false, msg: "Callback failed", status: "failed" });
  }
}

export { initiateDeposit, paymentCallback };
