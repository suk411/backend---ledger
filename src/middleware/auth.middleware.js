import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";

export async function authMiddleware(req, res, next) {
  try {
    console.log("🔐 Auth middleware triggered");

    const token =
      req.cookies.token || req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      console.log("❌ No token provided");
      return res.status(401).json({
        message: "Authentication token is missing",
        status: "failed",
      });
    }

    console.log("🔍 Verifying token...");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Token decoded:", decoded);

    const user = await userModel.findOne({ userId: decoded.id });

    if (!user) {
      console.log("❌ User not found for userId:", decoded.id);
      return res.status(401).json({
        message: "User not found",
        status: "failed",
      });
    }

    req.user = { userId: user.userId, _id: user._id, mobile: user.mobile };
    console.log("👤 User attached:", req.user);

    next();
  } catch (error) {
    console.log("❌ Auth error:", error.message);
    return res.status(401).json({
      message: "Invalid authentication token",
      status: "failed",
      error: error.message,
    });
  }
}

export default { authMiddleware };
