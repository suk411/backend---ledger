import userModel from "../models/user.model.js";
import accountModel from "../models/account.model.js";
import jwt from "jsonwebtoken";

async function userRegisterController(req, res) {
  const { mobile, password } = req.body;

  try {
    // check if user exists
    const existingUser = await userModel.findOne({ mobile });

    if (existingUser) {
      return res.status(400).json({
        msg: "User already exists",
        status: "failed",
      });
    }

    // create user
    const newUser = new userModel({ mobile, password });
    await newUser.save();
    console.log("USER CREATED:", newUser.userId);
    // create account automatically
    await accountModel.create({
      user: newUser.userId,
      balance: 0,
      currency: "INR",
      status: "active",
    });
    console.log("ACCOUNT CREATED:", account);

    // generate token
    const token = jwt.sign({ userId: newUser.userId }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      user: { id: newUser.userId },
      msg: "Register success",
      status: "success",
      token,
    });
  } catch (error) {
    res.status(500).json({
      msg: "Error registering user",
      status: "failed",
      error: error.message,
    });
  }
}

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
      user: { id: user.userId },
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

export default { userRegisterController, userLoginController };
