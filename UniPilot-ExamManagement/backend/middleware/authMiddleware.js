const { verifyToken } = require("../utils/jwt");
const { User } = require("../models");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = verifyToken(token);

      req.user = decoded; // Contains userId, role, etc.

      // Optionally fetch full user if needed, but payload has enough for route protection
      // To match Main system behavior which likely attaches user to req
      // (checking Main authMiddleware would confirm, but let's assume standard practice)
      // Main's authController uses `req.user.userId`.
      // Our generateAccessToken in utils/jwt.js puts `userId` in payload.
      // So req.user.userId will work.

      next();
    } catch (error) {
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role ${req.user.role} is not authorized to access this route`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
