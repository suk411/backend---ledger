import DepositOrder from "../models/depositOrder.model.js";
import { createPaymentOrder } from "../services/paysimply.service.js";

async function initiateDeposit(req, res) {
  try {
    const { userId, amount } = req.body;
    const merOrderNo = `MER${Date.now()}${userId}`;

    const order = await DepositOrder.create({
      userId,
      amount,
      currency: "INR",
      status: "PENDING",
      gatewayOrderNo: merOrderNo,
    });

    const gatewayRes = await createPaymentOrder({
      merOrderNo,
      amount,
      user: { userId },
    });

    order.paymentLinks = gatewayRes.data || {};
    await order.save();

    res.json({ order, gatewayRes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function paymentCallback(req, res) {
  try {
    const { merOrderNo, status } = req.body;
    const order = await DepositOrder.findOne({ gatewayOrderNo: merOrderNo });
    if (!order) return res.status(404).json({ error: "Order not found" });

    order.status = status;
    await order.save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export  { initiateDeposit, paymentCallback };
