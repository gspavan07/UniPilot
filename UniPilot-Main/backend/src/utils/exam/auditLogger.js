import ExamAuditLog from "../../modules/exams/models/ExamAuditLog.js";
import logger from "../../utils/logger.js";

/**
 * Audit Logger Utility
 * Centralized service for logging all exam-related actions
 */
class AuditLogger {
  /**
   * Log an action to the audit trail
   * @param {Object} params - Audit log parameters
   * @param {Object} params.user - User object from req.user
   * @param {string} params.action - Action type (CREATE, UPDATE, DELETE, GENERATE, PUBLISH)
   * @param {string} params.module - Module name (HALL_TICKET, EXAM_SCHEDULE, SEATING, GRADES)
   * @param {string} params.description - Human-readable description
   * @param {Object} [params.entityType] - Type of entity affected
   * @param {string} [params.entityId] - ID of entity affected
   * @param {Object} [params.changes] - Before/after values
   * @param {Object} [params.metadata] - Additional context
   * @param {Object} [params.request] - Express request object
   * @param {string} [params.status] - Status (success/failure/pending)
   * @param {string} [params.error] - Error message if failed
   */
  async log({
    user,
    action,
    module = "EXAM_MANAGEMENT",
    description,
    entityType = null,
    entityId = null,
    changes = null,
    metadata = null,
    request = null,
    status = "success",
    error = null,
  }) {
    try {
      const auditData = {
        user_id: user.userId || user.id,
        user_email: user.email,
        user_role: user.role,
        action,
        module,
        entity_type: entityType,
        entity_id: entityId,
        description,
        changes,
        metadata,
        status,
        error_message: error,
      };

      // Add request details if provided
      if (request) {
        auditData.ip_address =
          request.ip ||
          request.headers["x-forwarded-for"] ||
          request.connection.remoteAddress;
        auditData.user_agent = request.headers["user-agent"];
        auditData.request_method = request.method;
        auditData.request_url = request.originalUrl || request.url;
      }

      await ExamAuditLog.create(auditData);

      logger.info(`Audit log created: ${action} on ${module} by ${user.email}`);
    } catch (error) {
      // Don't throw - audit logging should not block the main operation
      logger.error("Failed to create audit log:", error);
    }
  }

  /**
   * Log a successful action
   */
  async logSuccess(params) {
    return this.log({ ...params, status: "success" });
  }

  /**
   * Log a failed action
   */
  async logFailure(params) {
    return this.log({ ...params, status: "failure" });
  }

  /**
   * Get audit logs with filters
   */
  async getAuditLogs(filters = {}, options = {}) {
    const where = {};

    if (filters.userId) where.user_id = filters.userId;
    if (filters.module) where.module = filters.module;
    if (filters.action) where.action = filters.action;
    if (filters.entityType) where.entity_type = filters.entityType;
    if (filters.entityId) where.entity_id = filters.entityId;
    if (filters.status) where.status = filters.status;

    // Date range filtering
    if (filters.startDate || filters.endDate) {
      where.created_at = {};
      if (filters.startDate)
        where.created_at.$gte = new Date(filters.startDate);
      if (filters.endDate) where.created_at.$lte = new Date(filters.endDate);
    }

    const logs = await ExamAuditLog.findAll({
      where,
      order: [["created_at", "DESC"]],
      limit: options.limit || 100,
      offset: options.offset || 0,
    });

    return logs;
  }
}

export default new AuditLogger();
