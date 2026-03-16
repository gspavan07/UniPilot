import { DataTypes } from "sequelize";
import { sequelize } from "../../../config/database.js";

const ProctorFeedback = sequelize.define(
  "ProctorFeedback",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    assignment_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "proctor_assignments", key: "id" },
    },
    session_id: {
      type: DataTypes.UUID,
      references: { model: "proctor_sessions", key: "id" },
    },
    feedback_text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    feedback_category: {
      type: DataTypes.STRING(50), // ACADEMIC, BEHAVIORAL, ATTENDANCE, CAREER
    },
    severity: {
      type: DataTypes.STRING(20), // POSITIVE, NEUTRAL, CONCERN, CRITICAL
      defaultValue: "NEUTRAL",
    },
    is_visible_to_student: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_visible_to_parent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "users", key: "id" },
    },
  },
  {
    tableName: "proctor_feedback",
    schema: 'proctoring',
    timestamps: true,
    underscored: true,
  }
);

export default ProctorFeedback;
