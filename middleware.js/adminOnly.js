// Pre-shared admin password
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "supersecretpassword";

export const adminOnly = (req, res, next) => {
  // Check password in headers
  const password = req.headers["x-admin-password"];
  if (!password || password !== ADMIN_PASSWORD) {
    return res.status(403).json({ message: "Access denied: admins only" });
  }
  next();
};
