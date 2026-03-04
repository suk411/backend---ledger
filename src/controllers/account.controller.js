import accountModel from "../models/account.model.js";

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
      balance: account.balance,
      currency: account.currency,
    });
  } catch (error) {
    res.status(500).json({
      status: "failed",
      msg: error.message,
    });
  }
}

export default getUserBalanceController;
