import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";

export async function authMiddleware(req, res, next) {
  try {
    const token =
      req.cookies.token || req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        msg: "Authentication token is missing",
        status: "failed",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await userModel.findOne({ userId: decoded.id });

    if (!user) {
      console.log("❌ User not found for userId:", decoded.id);
      return res.status(401).json({
        msg: "User not found",
        status: "failed",
      });
    }

    req.user = {
      userId: user.userId,
      _id: user._id,
      mobile: user.mobile,
      admin: user.admin,
    };

    next();
  } catch (error) {
    console.log("❌ Auth error:", error.msg);
    return res.status(401).json({
      msg: "Invalid authentication token",
      status: "failed",
      error: error.msg,
    });
  }
}

export default { authMiddleware };
