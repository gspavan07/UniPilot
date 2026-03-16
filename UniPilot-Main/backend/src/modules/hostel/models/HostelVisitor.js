import { DataTypes } from "sequelize";
import { sequelize } from "../../../config/database.js";

const HostelVisitor = sequelize.define(
  "HostelVisitor",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    student_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    visitor_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    visitor_phone: {
      type: DataTypes.STRING,
    },
    relationship: {
      type: DataTypes.STRING,
    },
    purpose: {
      type: DataTypes.STRING,
    },
    entry_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    exit_time: {
      type: DataTypes.DATE,
    },
    id_proof_type: {
      type: DataTypes.STRING,
    },
    id_proof_number: {
      type: DataTypes.STRING,
    },
  },
  {
    tableName: "hostel_visitors",
    schema: 'hostel',
    underscored: true,
    timestamps: true,
  },
);

export default HostelVisitor;
