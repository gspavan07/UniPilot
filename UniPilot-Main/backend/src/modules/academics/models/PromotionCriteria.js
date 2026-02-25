import { DataTypes } from "sequelize";
import { sequelize } from "../../../config/database.js";

const PromotionCriteria = sequelize.define(
  "PromotionCriteria",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    program_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "programs", key: "id" },
    },
    from_semester: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    to_semester: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    min_attendance_percentage: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 75.0,
    },
    min_cgpa: {
      type: DataTypes.DECIMAL(3, 2),
    },
    max_backlogs_allowed: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    fee_clearance_required: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    library_clearance_required: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "promotion_criteria",
    timestamps: true,
    underscored: true,
  }
);

export default PromotionCriteria;
