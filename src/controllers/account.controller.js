import accountModel from "../models/account.model.js";
import DepositOrder from "../models/depositOrder.model.js";

async function getUserBalanceController(req, res) {
  try {
    const userId = req.user.userId;

    const account = await accountModel.findOne({ user: userId });

    if (!account) {
      return res.status(404).json({
        status: "failed",
        msg: "Account not found",
      });
    }

    res.status(200).json({
      status: "success",
      userId: account.user,
      balance: account.balance,
    });
  } catch (error) {
    res.status(500).json({
      status: "failed",
      msg: error.message,
    });
  }
}

async function getOwnDepositOrders(req, res) {
  try {
    const userId = req.user.userId;
    const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 15));
    const page = Math.max(1, Number(req.query.page) || 1);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      DepositOrder.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("-_id -__v"),
      DepositOrder.countDocuments({ userId }),
    ]);

    res.json({
      status: "success",
      total,
      page,
      limit,
      items,
    });
  } catch (error) {
    res.status(500).json({
      status: "failed",
      msg: error.message,
    });
  }
}

async function adminFindDepositOrders(req, res) {
  try {
    const { orderId, userId } = req.query;
    if (!orderId && !userId) {
      return res
        .status(400)
        .json({ status: "failed", msg: "orderId or userId is required" });
    }

    if (orderId) {
      const order = await DepositOrder.findOne({ orderId }).select("-__v");
      if (!order) {
        return res
          .status(404)
          .json({ status: "failed", msg: "Order not found" });
      }
      return res.json({ status: "success", items: [order] });
    }

    const idNum = Number(userId);
    if (Number.isNaN(idNum)) {
      return res.status(400).json({ status: "failed", msg: "Invalid userId" });
    }
    const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 15));
    const page = Math.max(1, Number(req.query.page) || 1);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      DepositOrder.find({ userId: idNum })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("-__v"),
      DepositOrder.countDocuments({ userId: idNum }),
    ]);

    if (items.length === 0) {
      return res
        .status(404)
        .json({ status: "failed", msg: "No orders found for user" });
    }

    res.json({ status: "success", total, page, limit, items });
  } catch (error) {
    res.status(500).json({
      status: "failed",
      msg: error.message,
    });
  }
}

export default getUserBalanceController;
export { getOwnDepositOrders, adminFindDepositOrders };
