import jwt from "jsonwebtoken";
import logger from "../utils/logger.js";

/**
 * Generate JWT access token
 * @param {Object} payload - Token payload (userId, role, tenantId)
 * @returns {string} JWT token
 */
export const generateAccessToken = (payload, expiresIn) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: expiresIn || process.env.JWT_EXPIRY || "1h",
  });
};

/**
 * Generate refresh token
 * @param {Object} payload - Token payload
 * @returns {string} Refresh token
 */
export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d",
  });
};

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @returns {Object} Decoded payload
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    logger.warn("Token verification failed:", error.message);
    throw error;
  }
};

/**
 * Verify refresh token
 * @param {string} token - Refresh token
 * @returns {Object} Decoded payload
 */
export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
  } catch (error) {
    logger.warn("Refresh token verification failed:", error.message);
    throw error;
  }
};

