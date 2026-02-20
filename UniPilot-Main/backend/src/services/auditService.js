import { AuditLog } from "../models/index.js";
import logger from "../utils/logger.js";

/**
 * Audit Service for tracking critical actions
 */
class AuditService {
  /**
   * Log an action
   * @param {Object} params
   * @param {string} params.action - Action name (e.g., "PAYROLL_PUBLISH")
   * @param {Object} params.actor - The user performing the action (req.user)
   * @param {string|Object} [params.details] - Additional details
   * @param {string} [params.entityType] - Target entity type
   * @param {string} [params.entityId] - Target entity ID
   * @param {Object} [params.req] - Express Request object (to extract IP)
   * @param {Object} [params.transaction] - Sequelize transaction
   */
  async log({
    action,
    actor,
    details,
    entityType,
    entityId,
    req,
    transaction,
  }) {
    try {
      const ip_address = req
        ? req.headers["x-forwarded-for"] || req.socket.remoteAddress
        : null;

      const userId = actor ? actor.id || actor.userId : null;

      await AuditLog.create(
        {
          user_id: userId,
          action,
          entity_type: entityType,
          entity_id: entityId ? String(entityId) : null,
          details: typeof details === "object" ? details : { info: details },
          ip_address,
        },
        { transaction }
      );
    } catch (error) {
      // Audit failure should not crash the app, but we should log it
      logger.error("Audit Logging Failed:", error);
    }
  }
}

export default new AuditService();
