import { hashPassword, comparePassword } from "../../../utils/password.js";
import { generateAccessToken } from "../../../utils/jwt.js";
import { genRefreshToken, hashToken } from "../../../utils/crypto.js";
import { genCsrfToken } from "../../../middleware/csrfDoubleSubmit.js";
import logger from "../../../utils/logger.js";
import crypto from "crypto";
import { Op } from "sequelize";
import { v4 as uuidv4 } from "uuid";
import { Permission, Role, Session, User } from "../models/index.js";
import SettingsService from "../../settings/services/index.js";
import AcademicService from "../../academics/services/index.js";
import { sequelize } from "../../../config/database.js";





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
        const existing = await sequelize.models.StaffProfile.findOne({
          where: { employee_id: userData.employee_id },
        });
        if (existing) throw new Error("Employee ID already exists");
      }

      if (userData.student_id) {
        const existing = await sequelize.models.StudentProfile.findOne({
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
  /**
   * Login user
   */
  async login(email, password, rememberMe = false, ipAddress = "", userAgent = "") {
    try {
      // Find user
      const user = await User.findOne({
        where: { email },
        include: [
          {
            model: sequelize.models.StudentProfile,
            as: "student_profile",
            required: false,
          },
          {
            model: sequelize.models.StaffProfile,
            as: "staff_profile",
            required: false,
          },
          {
            model: Role,
            as: "role_data",
            include: [{ model: Permission, as: "permissions" }],
          },
        ],
      });

      // Hydrate cross-module data manually
      if (user) {
        const programId = user.student_profile?.program_id || user.program_id;
        const regulationId = user.student_profile?.regulation_id || user.regulation_id;
        const staffDeptId = user.staff_profile?.department_id || user.department_id;

        const [program, regulation] = await Promise.all([
          programId
            ? AcademicService.getProgramById(programId, {
                attributes: ["id", "name", "code", "department_id"],
              })
            : null,
          regulationId
            ? AcademicService.getRegulationById(regulationId, {
                attributes: ["id", "name", "code"],
              })
            : null,
        ]);

        const departmentId = staffDeptId || program?.department_id || null;
        const department = departmentId
          ? await AcademicService.getDepartmentById(departmentId, {
              attributes: ["id", "name", "code"],
            })
          : null;

        user.dataValues.department = department;
        user.dataValues.department_id = departmentId;
        user.dataValues.program = program;
        user.dataValues.regulation = regulation;

        // Map profile fields for backward compat
        if (user.student_profile) {
          user.dataValues.current_semester = user.student_profile.current_semester || user.current_semester;
          user.dataValues.student_id = user.student_profile.student_id || user.student_id;
        }
        if (user.staff_profile) {
          user.dataValues.employee_id = user.staff_profile.employee_id || user.employee_id;
        }
      }

      if (!user) {
        await SettingsService.log({ action: 'LOGIN_FAIL', details: { reason: 'User not found', email }, req: { headers: { "x-forwarded-for": ipAddress } } });
        throw new Error("Invalid credentials");
      }

      // Check if user is active (account lock)
      if (!user.is_active) {
        await SettingsService.log({ actor: { id: user.id }, action: 'LOGIN_BLOCKED', entityType: 'User', entityId: user.id, details: { reason: 'Account deactivated', email }, req: { headers: { "x-forwarded-for": ipAddress } } });
        throw new Error("Your account has been deactivated. Please contact your administrator.");
      }

      // Verify password
      const isValidPassword = await comparePassword(
        password,
        user.password_hash,
      );

      if (!isValidPassword) {
        await SettingsService.log({ actor: { id: user.id }, action: 'LOGIN_FAIL', entityType: 'User', entityId: user.id, details: { reason: 'Wrong password', email }, req: { headers: { "x-forwarded-for": ipAddress } } });
        throw new Error("Invalid credentials");
      }

      // Update last login
      await user.update({ last_login: new Date() });

      // Generate tokens
      // If rememberMe is true, set expiry to 30 days
      const tokenExpiry = rememberMe ? "30d" : process.env.JWT_EXPIRY || "1h";
      const refreshTTLMs = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;

      // Limit active sessions (e.g. 5 max)
      const activeSessionsCount = await Session.count({ where: { user_id: user.id, revoked: false } });
      if (activeSessionsCount >= 5) {
        const oldestSession = await Session.findOne({
          where: { user_id: user.id, revoked: false },
          order: [['created_at', 'ASC']]
        });
        if (oldestSession) {
          await oldestSession.update({ revoked: true });
        }
      }

      const sessionId = uuidv4();
      const refreshPlain = genRefreshToken();
      const refreshHash = hashToken(refreshPlain);
      const expiresAt = new Date(Date.now() + refreshTTLMs);

      const session = await Session.create({
        id: sessionId,
        user_id: user.id,
        refresh_token_hash: refreshHash,
        ip_address: ipAddress,
        user_agent: userAgent,
        expires_at: expiresAt
      });

      const accessToken = generateAccessToken(
        {
          userId: user.id,
          sessionId: session.id,
          email: user.email,
          role: user.role,
          department_id: user.dataValues.department_id || null,
          name: `${user.first_name}_${user.last_name || ""}`.replace(
            /\s+/g,
            "_",
          ),
        },
        tokenExpiry,
      );

      const csrfToken = genCsrfToken();

      // Audit log
      await SettingsService.log({ actor: { id: user.id }, action: 'LOGIN_SUCCESS', entityType: 'Session', entityId: sessionId, details: { email: user.email, userAgent }, req: { headers: { "x-forwarded-for": ipAddress } } });

      logger.info(`User logged in: ${user.email} (Remember Me: ${rememberMe})`);

      return {
        user: {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          role: user.role,
          department: user.department,
          department_id: user.dataValues.department_id || null,
          program: user.program,
          regulation: user.regulation,
          is_placement_coordinator: user.is_placement_coordinator,
          current_semester: user.current_semester,
          student_id: user.student_id,
          employee_id: user.employee_id,
          permissions: user.role_data?.permissions?.map((p) => p.slug) || [],
          must_change_password: !!user.must_change_password,
        },
        accessToken,
        refreshPlain,
        csrfToken,
        refreshTTLMs
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
          {
            model: sequelize.models.StudentProfile,
            as: "student_profile",
            required: false,
          },
          {
            model: sequelize.models.StaffProfile,
            as: "staff_profile",
            required: false,
          },
          {
            model: Role,
            as: "role_data",
            include: [{ model: Permission, as: "permissions" }],
          },
        ],
        attributes: { exclude: ["password_hash", "password_reset_token"] },
      });

      // Hydrate cross-module data manually
      if (user) {
        const programId = user.student_profile?.program_id || user.program_id;
        const regulationId = user.student_profile?.regulation_id || user.regulation_id;
        const staffDeptId = user.staff_profile?.department_id || user.department_id;

        const [program, regulation, documents] = await Promise.all([
          programId
            ? AcademicService.getProgramById(programId, {
                attributes: ["id", "name", "code", "department_id"],
              })
            : null,
          regulationId
            ? AcademicService.getRegulationById(regulationId, {
                attributes: ["id", "name", "code"],
              })
            : null,
          AcademicService.getStudentDocuments
            ? AcademicService.getStudentDocuments(userId)
            : [],
        ]);

        const departmentId = staffDeptId || program?.department_id || null;
        const department = departmentId
          ? await AcademicService.getDepartmentById(departmentId, {
              attributes: ["id", "name", "code"],
            })
          : null;

        user.dataValues.department = department;
        user.dataValues.department_id = departmentId;
        user.dataValues.program = program;
        user.dataValues.regulation = regulation;
        user.dataValues.documents = documents;

        // Map profile fields for backward compat
        if (user.student_profile) {
          user.dataValues.current_semester = user.student_profile.current_semester || user.current_semester;
          user.dataValues.student_id = user.student_profile.student_id || user.student_id;
          user.dataValues.batch_year = user.student_profile.batch_year || user.batch_year;
          user.dataValues.section = user.student_profile.section || user.section;
          user.dataValues.academic_status = user.student_profile.academic_status || user.academic_status;
        }
        if (user.staff_profile) {
          user.dataValues.employee_id = user.staff_profile.employee_id || user.employee_id;
          user.dataValues.designation = user.staff_profile.designation || user.designation;
        }
      }

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
   * Refresh token
   */
  async refresh(refreshPlain, ipAddress = "", userAgent = "") {
    try {
      if (!refreshPlain) throw new Error("Missing refresh token");

      const refreshHash = hashToken(refreshPlain);
      const session = await Session.findOne({ where: { refresh_token_hash: refreshHash } });

      if (!session || session.revoked || session.expires_at < new Date()) {
        throw new Error("Invalid or expired refresh token");
      }

      const user = await User.findByPk(session.user_id, {
        include: [
          {
            model: sequelize.models.StaffProfile,
            as: "staff_profile",
            required: false,
          },
          {
            model: Role,
            as: "role_data",
            include: [{ model: Permission, as: "permissions" }],
          },
        ],
      });

      if (!user || !user.is_active) throw new Error("Account is deactivated or invalid");

      const newRefreshPlain = genRefreshToken();
      const newRefreshHash = hashToken(newRefreshPlain);
      const refreshTTLMs = 7 * 24 * 60 * 60 * 1000;
      const newExpiresAt = new Date(Date.now() + refreshTTLMs);

      await session.update({
        refresh_token_hash: newRefreshHash,
        last_used_at: new Date(),
        expires_at: newExpiresAt
      });

      const accessToken = generateAccessToken(
        {
          userId: user.id,
          sessionId: session.id,
          email: user.email,
          role: user.role,
          department_id: user.staff_profile?.department_id || null,
          name: `${user.first_name}_${user.last_name || ""}`.replace(/\s+/g, "_"),
        },
        process.env.JWT_EXPIRY || "1h",
      );

      // Audit log
      await SettingsService.log({ actor: { id: user.id }, action: 'TOKEN_REFRESH', entityType: 'Session', entityId: session.id, details: { userAgent }, req: { headers: { "x-forwarded-for": ipAddress } } });

      return { accessToken, newRefreshPlain, refreshTTLMs };
    } catch (error) {
      logger.error("Refresh token error:", error);
      throw error;
    }
  }

  /**
   * Logout user session
   */
  async logout(sessionId, userId = null, ipAddress = '') {
    if (sessionId) {
      await Session.update({ revoked: true }, { where: { id: sessionId } });
      if (userId) {
        await SettingsService.log({ actor: { id: userId }, action: 'LOGOUT', entityType: 'Session', entityId: sessionId, req: { headers: { "x-forwarded-for": ipAddress } } });
      }
    }
  }

  /**
   * Logout all other sessions
   */
  async logoutAll(userId, currentSessionId, ipAddress = '') {
    const [revokedCount] = await Session.update(
      { revoked: true },
      { where: { user_id: userId, id: { [Op.ne]: currentSessionId }, revoked: false } }
    );
    await SettingsService.log({ actor: { id: userId }, action: 'LOGOUT_ALL', entityType: 'User', entityId: userId, details: { sessionsRevoked: revokedCount }, req: { headers: { "x-forwarded-for": ipAddress } } });
    return revokedCount;
  }

  /**
   * Change password
   */
  async changePassword(userId, oldPassword, newPassword, currentSessionId) {
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

      // Update password and clear must_change_password flag
      await user.update({ password_hash, must_change_password: false });

      // Revoke all other sessions for security
      if (currentSessionId) {
        await this.logoutAll(userId, currentSessionId);
      }

      await SettingsService.log({ actor: { id: userId }, action: 'PASSWORD_CHANGE', entityType: 'User', entityId: userId, details: { email: user.email } });
      logger.info(`Password changed for user: ${user.email}`);

      return { message: "Password changed successfully" };
    } catch (error) {
      logger.error("Change password error:", error);
      throw error;
    }
  }

  /**
   * Forgot Password
   */
  async forgotPassword(email) {
    try {
      const user = await User.findOne({ where: { email } });

      if (!user) {
        throw new Error("User not found with this email");
      }

      // Generate reset token (random hex string)
      const resetToken = crypto.randomBytes(32).toString("hex");
      const passwordResetToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

      const passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour

      await user.update({
        password_reset_token: passwordResetToken,
        password_reset_expires: passwordResetExpires,
      });

      // Valid URL needs frontend base URL. For now we assume a standard path.
      // We will log the reset link to the console as requested.
      const resetURL = `${process.env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`;

      const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

      // LOGGING EMAIL TO CONSOLE
      console.log("==========================================");
      console.log(" PASSWORD RESET LINK (MOCK EMAIL) ");
      console.log(` To: ${email}`);
      console.log(` Link: ${resetURL}`);
      console.log("==========================================");

      return { message: "Token sent to email!" };
    } catch (error) {
      logger.error("Forgot password error:", error);
      throw error;
    }
  }

  /**
   * Reset Password
   */
  async resetPassword(token, newPassword) {
    try {
      const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

      const user = await User.findOne({
        where: {
          password_reset_token: hashedToken,
          password_reset_expires: { [Op.gt]: Date.now() },
        },
      });

      if (!user) {
        throw new Error("Token is invalid or has expired");
      }

      const password_hash = await hashPassword(newPassword);

      await user.update({
        password_hash,
        password_reset_token: null,
        password_reset_expires: null,
      });

      logger.info(`Password reset successfully for user: ${user.email}`);

      return { message: "Password reset successful" };
    } catch (error) {
      logger.error("Reset password error:", error);
      throw error;
    }
  }
}

export default new AuthService();
