import DepositOrder from "../models/depositOrder.model.js";
import { createPaymentOrder } from "../services/paysimply.service.js";
import accountModel from "../models/account.model.js";

async function initiateDeposit(req, res) {
  try {
    const { userId, amount } = req.body;

    // ✅ Check if user account exists
    const account = await accountModel.findOne({ user: userId });
    if (!account) {
      console.error(`❌ No account found for userId=${userId}`);
      return res.status(404).json({
        msg: "User not found",
        status: "failed",
      });
    }

    const merOrderNo = `MER${Date.now()}${userId}`;
    const orderId = `DP${Date.now()}${userId}`; // ✅ unique orderId

    console.log(
      `➡️ Initiating deposit: userId=${userId}, amount=${amount}, merOrderNo=${merOrderNo}`,
    );

    // ✅ Create local deposit order
    const order = await DepositOrder.create({
      orderId,
      userId,
      amount,
      currency: "INR",
      status: "PENDING",
      gatewayOrderNo: merOrderNo,
    });

    // ✅ Call Paysimply API
    const gatewayRes = await createPaymentOrder({
      merOrderNo,
      amount,
      user: { userId },
    });

    order.paymentLinks = gatewayRes.data || {};
    await order.save();

    console.log("✅ Deposit order created successfully:", order.orderId);

    res.json({
      order,
      gatewayRes,
      msg: "Deposit order initiated successfully",
      status: "success",
    });
  } catch (err) {
    console.error("❌ Error in initiateDeposit:", err.message);
    res.status(500).json({
      msg: "Error initiating deposit",
      status: "failed",
      error: err.message,
    });
  }
}

async function paymentCallback(req, res) {
  try {
    const { merOrderNo, status } = req.body;
    console.log(
      `➡️ Callback received: merOrderNo=${merOrderNo}, status=${status}`,
    );

    const order = await DepositOrder.findOne({ gatewayOrderNo: merOrderNo });
    if (!order) {
      console.error(`❌ DepositOrder not found for merOrderNo=${merOrderNo}`);
      return res.status(404).json({
        msg: "Order not found",
        status: "failed",
      });
    }

    order.status = status;
    await order.save();

    console.log(`✅ Order ${order.orderId} updated to status=${status}`);

    res.json({
      success: true,
      msg: "Payment callback processed successfully",
      status: "success",
    });
  } catch (err) {
    console.error("❌ Error in paymentCallback:", err.message);
    res.status(500).json({
      msg: "Error processing callback",
      status: "failed",
      error: err.message,
    });
  }
}

export { initiateDeposit, paymentCallback };
