import { DataTypes } from "sequelize";
import { sequelize } from "../../../config/database.js";

/**
 * LateFeeSlab Model
 * Date-based late fee slabs for flexible fine calculation
 */
const LateFeeSlab = sequelize.define(
  "late_fee_slab",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    fee_config_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "exam_fee_configurations",
        key: "id",
      },
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    fine_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    tableName: "late_fee_slabs",
    underscored: true,
    timestamps: true,
    updatedAt: false,
  },
);

export default LateFeeSlab;
