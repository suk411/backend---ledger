import accountModel from "../models/account.model.js";

async function createAccountController(req, res) {
  const user = req.user; // Assuming authMiddleware attaches user to req
  const account = await accountModel.create({
    user: user._id,
  });

  res.status(201).json({
    account,
    message: "Account created successfully",
    status: "success",
  });
}

export default { createAccountController };
