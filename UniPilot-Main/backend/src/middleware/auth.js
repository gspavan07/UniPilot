const { verifyToken } = require("../utils/jwt");
const logger = require("../utils/logger");

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user to request
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "No token provided",
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = verifyToken(token);

    // Attach user info to request
    req.user = decoded;

    next();
  } catch (error) {
    logger.warn("Authentication failed:", error.message);
    res.status(401).json({
      success: false,
      error: "Invalid or expired token",
    });
  }
};

const { User, Role, Permission } = require("../models");

/**
 * Authorization Middleware
 * Checks if user has required role(s)
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Not authenticated",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: "Insufficient permissions (Role mismatch)",
      });
    }

    next();
  };
};

/**
 * Permission Middleware
 * Checks if user has specific permission slug
 */
const checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: "Not authenticated",
        });
      }

      // Fetch user with their role and permissions
      const user = await User.findByPk(req.user.userId, {
        include: [
          {
            model: Role,
            as: "role_data",
            include: [
              {
                model: Permission,
                as: "permissions",
                attributes: ["slug"],
              },
            ],
          },
        ],
      });

      if (!user || !user.role_data) {
        return res.status(403).json({
          success: false,
          error: "User role not found",
        });
      }

      // Administrator bypasses all permission checks
      if (
        user.role === "administrator" ||
        user.role === "admin" ||
        user.role === "super_admin"
      ) {
        return next();
      }

      const requiredPermissions = Array.isArray(requiredPermission)
        ? requiredPermission
        : [requiredPermission];

      const hasPermission = user.role_data.permissions.some((p) =>
        requiredPermissions.includes(p.slug),
      );

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          error: `Required permission missing: ${requiredPermissions.join(" or ")}`,
        });
      }

      next();
    } catch (error) {
      logger.error("Error in checkPermission:", error);
      res.status(500).json({
        success: false,
        error: "Security Check Failed",
      });
    }
  };
};

module.exports = {
  authenticate,
  authorize,
  checkPermission,
};
