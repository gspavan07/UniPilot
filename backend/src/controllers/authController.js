const authService = require("../services/authService");
const logger = require("../utils/logger");

/**
 * Authentication Controller
 * Handles HTTP requests for authentication
 */
class AuthController {
  /**
   * Register a new user
   * POST /api/auth/register
   */
  async register(req, res, next) {
    try {
      const userData = req.body;

      const user = await authService.register(userData);

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login user
   * POST /api/auth/login
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: "Email and password are required",
        });
      }

      const result = await authService.login(email, password);

      res.json({
        success: true,
        message: "Login successful",
        data: result,
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get current user profile
   * GET /api/auth/me
   */
  async getProfile(req, res, next) {
    try {
      const userId = req.user.userId;

      const user = await authService.getProfile(userId);

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      if (error.message === "User not found") {
        return res.status(401).json({
          success: false,
          error: "Session invalid: User no longer exists",
        });
      }
      next(error);
    }
  }

  /**
   * Change password
   * POST /api/auth/change-password
   */
  async changePassword(req, res, next) {
    try {
      const userId = req.user.userId;
      const { oldPassword, newPassword } = req.body;

      if (!oldPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          error: "Old password and new password are required",
        });
      }

      const result = await authService.changePassword(
        userId,
        oldPassword,
        newPassword
      );

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Logout user
   * POST /api/auth/logout
   */
  async logout(req, res) {
    // For JWT, logout is handled client-side by removing the token
    // Can implement token blacklisting with Redis here if needed
    res.json({
      success: true,
      message: "Logged out successfully",
    });
  }
}

module.exports = new AuthController();
