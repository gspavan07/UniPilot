import { DataTypes } from "sequelize";
import { sequelize } from "../../../config/database.js";

/**
 * Exam Audit Log Model
 * Tracks all actions performed in the Exam Management System
 */
const ExamAuditLog = sequelize.define(
  "ExamAuditLog",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    // Who performed the action
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      comment: "User who performed the action",
    },
    user_email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "Email of user for quick reference",
    },
    user_role: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: "Role of user at time of action",
    },

    // What action was performed
    action: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "Action type (e.g., CREATE, UPDATE, DELETE, GENERATE, PUBLISH)",
    },
    module: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment:
        "Module/Feature (e.g., HALL_TICKET, EXAM_SCHEDULE, SEATING, GRADES)",
    },
    entity_type: {
      type: DataTypes.STRING(100),
      comment: "Type of entity affected (e.g., hall_ticket, exam_schedule)",
    },
    entity_id: {
      type: DataTypes.STRING(255),
      comment: "ID of the entity affected",
    },

    // Action details
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "Human-readable description of the action",
    },
    changes: {
      type: DataTypes.JSONB,
      comment: "Before/after values for updates",
    },
    metadata: {
      type: DataTypes.JSONB,
      comment:
        "Additional context (filters used, count of items affected, etc.)",
    },

    // Request details
    ip_address: {
      type: DataTypes.STRING(45),
      comment: "IP address of the request",
    },
    user_agent: {
      type: DataTypes.TEXT,
      comment: "Browser/client user agent",
    },
    request_method: {
      type: DataTypes.STRING(10),
      comment: "HTTP method (GET, POST, PUT, DELETE)",
    },
    request_url: {
      type: DataTypes.TEXT,
      comment: "API endpoint called",
    },

    // Status
    status: {
      type: DataTypes.ENUM("success", "failure", "pending"),
      defaultValue: "success",
    },
    error_message: {
      type: DataTypes.TEXT,
      comment: "Error message if action failed",
    },

    // Timestamps
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "exam_audit_logs",
    schema: 'exams',
    timestamps: false, // We only need created_at
    indexes: [
      { fields: ["user_id"] },
      { fields: ["module"] },
      { fields: ["action"] },
      { fields: ["entity_type", "entity_id"] },
      { fields: ["created_at"] },
      { fields: ["user_email"] },
    ],
  },
);

export default ExamAuditLog;
