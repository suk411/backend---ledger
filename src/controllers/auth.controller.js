import userModel from "../models/user.model.js";

import jwt from "jsonwebtoken";



//user register controller
// post /api/auth/register
async function userRegisterController(req, res) {
  const { mobile, password } = req.body;

  try {
    const existingUser = await userModel.findOne({ mobile });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
        status: "failed",
      });
    }

    const newUser = new userModel({ mobile, password });
    await newUser.save();

    const token = jwt.sign({ id: newUser.userId }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });
    res.status(201).json({
      user: {
        id: newUser.userId,
      },
      message: "Register success",
      status: "success",
      token,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error registering user",
      status: "failed",
      error: error.message,
    });
  }
}



//user login controller
// post /api/auth/login
async function userLoginController(req, res) {


  const { mobile, password } = req.body;
  const user = await userModel.findOne({ mobile }   ).select("+password") ;

  if (!user) {
    return res.status(404).json({
      message: "User not found",
      status: "failed",
    });
  }

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    return res.status(401).json({
      message: "Invalid password",
      status: "failed",
    });
  }

  const token = jwt.sign({ id: user.userId }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });

  res.status(200).json({
    user: {
      id: user.userId,
      
    },
    message: "Login success",
    status: "success",
    token,
  });
}




export default { userRegisterController, userLoginController };