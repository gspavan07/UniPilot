import { DataTypes } from "sequelize";
import { sequelize } from "../../../config/database.js";

const RoundResult = sequelize.define(
  "RoundResult",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    round_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    student_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    result: {
      type: DataTypes.ENUM("selected", "rejected", "on_hold", "absent"),
      defaultValue: "on_hold",
    },
    score: {
      type: DataTypes.DECIMAL(5, 2),
    },
    remarks: {
      type: DataTypes.TEXT,
    },
    uploaded_via: {
      type: DataTypes.STRING(20),
      defaultValue: "manual",
    },
  },
  {
    tableName: "round_results",
    schema: 'placement',
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        unique: true,
        fields: ["round_id", "student_id"],
      },
    ],
  },
);

export default RoundResult;
