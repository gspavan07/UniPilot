import authService from "../services/authService.js";

const buildRefreshCookieOptions = (refreshTTLMs, isProd) => ({
  httpOnly: true,
  secure: isProd,
  sameSite: "lax",
  path: "/",
  maxAge: refreshTTLMs,
});

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
      const { email, password, rememberMe } = req.body;
      const ipAddress = req.ip;
      const userAgent = req.headers["user-agent"] || "";

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: "Email and password are required",
        });
      }

      const result = await authService.login(email, password, rememberMe, ipAddress, userAgent);

      const isProd = process.env.NODE_ENV === "production";
      const cookieOptions = buildRefreshCookieOptions(result.refreshTTLMs, isProd);

      res.cookie("refreshToken", result.refreshPlain, cookieOptions);
      res.cookie("csrf_token", result.csrfToken, {
        secure: isProd,
        sameSite: "lax",
        path: "/",
        maxAge: result.refreshTTLMs,
      });

      res.json({
        success: true,
        message: "Login successful",
        data: {
          user: result.user,
          accessToken: result.accessToken,
        },
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Forgot Password
   * POST /api/auth/forgot-password
   */
  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }
      const result = await authService.forgotPassword(email);
      res.json({ success: true, message: result.message });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reset Password
   * POST /api/auth/reset-password
   */
  async resetPassword(req, res, next) {
    try {
      const { token, newPassword } = req.body;
      if (!token || !newPassword) {
        return res
          .status(400)
          .json({ error: "Token and new password are required" });
      }
      const result = await authService.resetPassword(token, newPassword);
      res.json({ success: true, message: result.message });
    } catch (error) {
      next(error);
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
      const sessionId = req.user.sessionId;
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
        newPassword,
        sessionId
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
   * Refresh token
   * POST /api/auth/refresh
   */
  async refresh(req, res, next) {
    try {
      const refreshPlain = req.cookies?.refreshToken;
      const ipAddress = req.ip;
      const userAgent = req.headers["user-agent"] || "";

      if (!refreshPlain) {
        return res.status(401).json({ success: false, error: "Missing refresh token" });
      }

      const result = await authService.refresh(refreshPlain, ipAddress, userAgent);

      const isProd = process.env.NODE_ENV === "production";
      const cookieOptions = buildRefreshCookieOptions(result.refreshTTLMs, isProd);

      res.cookie("refreshToken", result.newRefreshPlain, cookieOptions);

      res.json({
        success: true,
        accessToken: result.accessToken,
      });
    } catch (error) {
      // Clear cookies on refresh failure to force relogin
      res.clearCookie("refreshToken", { path: "/" });
      res.clearCookie("csrf_token", { path: "/" });
      res.status(401).json({ success: false, error: error.message });
    }
  }

  /**
   * Logout user
   * POST /api/auth/logout
   */
  async logout(req, res, next) {
    try {
      const sessionId = req.user?.sessionId;
      const userId = req.user?.userId;
      const ipAddress = req.ip;
      if (sessionId) {
        await authService.logout(sessionId, userId, ipAddress);
      }

      res.clearCookie("refreshToken", { path: "/" });
      res.clearCookie("csrf_token", { path: "/" });

      res.json({
        success: true,
        message: "Logged out successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logout from all other sessions
   * POST /api/auth/logout-all
   */
  async logoutAll(req, res, next) {
    try {
      const userId = req.user.userId;
      const sessionId = req.user.sessionId;
      const ipAddress = req.ip;

      const revokedCount = await authService.logoutAll(userId, sessionId, ipAddress);

      res.json({
        success: true,
        message: `Logged out from ${revokedCount} other session(s)`,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
