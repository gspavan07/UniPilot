const { User, Role, Permission } = require("../models");
const { hashPassword, comparePassword } = require("../utils/bcrypt");
const { generateAccessToken, generateRefreshToken } = require("../utils/jwt");
const logger = require("../utils/logger");

/**
 * Authentication Service
 * Business logic for user authentication
 */
class AuthService {
  /**
   * Register a new user
   */
  async register(userData) {
    try {
      // Check if email already exists
      const existingUser = await User.findOne({
        where: { email: userData.email },
      });

      if (existingUser) {
        throw new Error("Email already registered");
      }

      // Check if employee_id/student_id already exists
      if (userData.employee_id) {
        const existing = await User.findOne({
          where: { employee_id: userData.employee_id },
        });
        if (existing) throw new Error("Employee ID already exists");
      }

      if (userData.student_id) {
        const existing = await User.findOne({
          where: { student_id: userData.student_id },
        });
        if (existing) throw new Error("Student ID already exists");
      }

      // Hash password
      const password_hash = await hashPassword(userData.password);

      // Create user
      const user = await User.create({
        ...userData,
        password_hash,
        password: undefined, // Remove plain password
      });

      logger.info(`User registered: ${user.email} (${user.role})`);

      return user;
    } catch (error) {
      logger.error("Registration error:", error);
      throw error;
    }
  }

  /**
   * Login user
   */
  async login(email, password) {
    try {
      // Find user
      const user = await User.findOne({
        where: { email },
        include: [
          { association: "department" },
          { association: "program" },
          {
            model: Role,
            as: "role_data",
            include: [{ model: Permission, as: "permissions" }],
          },
        ],
      });

      if (!user) {
        throw new Error("Invalid credentials");
      }

      // Check if user is active
      if (!user.is_active) {
        throw new Error("Account is deactivated");
      }

      // Verify password
      const isValidPassword = await comparePassword(
        password,
        user.password_hash
      );

      if (!isValidPassword) {
        throw new Error("Invalid credentials");
      }

      // Update last login
      await user.update({ last_login: new Date() });

      // Generate tokens
      const accessToken = generateAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      const refreshToken = generateRefreshToken({
        userId: user.id,
      });

      logger.info(`User logged in: ${user.email}`);

      return {
        user: {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          role: user.role,
          department: user.department,
          program: user.program,
          // Add missing student/employee fields
          current_semester: user.current_semester,
          student_id: user.student_id,
          employee_id: user.employee_id,
          permissions: user.role_data?.permissions?.map((p) => p.slug) || [],
        },
        accessToken,
        refreshToken,
      };
    } catch (error) {
      logger.error("Login error:", error);
      throw error;
    }
  }

  /**
   * Get user profile
   */
  async getProfile(userId) {
    try {
      const user = await User.findByPk(userId, {
        include: [
          { association: "department" },
          { association: "program" },
          {
            model: Role,
            as: "role_data",
            include: [{ model: Permission, as: "permissions" }],
          },
        ],
        attributes: { exclude: ["password_hash", "password_reset_token"] },
      });

      if (!user) {
        throw new Error("User not found");
      }

      const userJson = user.toJSON();
      userJson.permissions =
        user.role_data?.permissions?.map((p) => p.slug) || [];
      delete userJson.role_data; // Clean up response

      return userJson;
    } catch (error) {
      logger.error("Get profile error:", error);
      throw error;
    }
  }

  /**
   * Change password
   */
  async changePassword(userId, oldPassword, newPassword) {
    try {
      const user = await User.findByPk(userId);

      if (!user) {
        throw new Error("User not found");
      }

      // Verify old password
      const isValid = await comparePassword(oldPassword, user.password_hash);

      if (!isValid) {
        throw new Error("Current password is incorrect");
      }

      // Hash new password
      const password_hash = await hashPassword(newPassword);

      // Update password
      await user.update({ password_hash });

      logger.info(`Password changed for user: ${user.email}`);

      return { message: "Password changed successfully" };
    } catch (error) {
      logger.error("Change password error:", error);
      throw error;
    }
  }
}

module.exports = new AuthService();
