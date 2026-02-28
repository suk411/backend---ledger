import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";

// Middleware to protect routes
export async function authMiddleware(req, res, next) {
  const token =
    req.cookies.token || req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({
      message: "Authentication token is missing",
      status: "failed",
    });
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await userModel.findOne({ userId: decoded.id });

      req.user = user; // Attach user to request object
      return next();
    } catch (error) {
      return res.status(401).json({
        message: "Invalid authentication token",
        status: "failed",
        error: error.message,
      });
    }
  }
}

export default { authMiddleware };
