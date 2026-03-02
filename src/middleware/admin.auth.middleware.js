export function adminMiddleware(req, res, next) {
  if (!req.user || !req.user.admin) {
    return res.status(403).json({
      msg: "Access denied: Admins only",
      status: "failed",
    });
  }
  next();
}

export default { adminMiddleware };
