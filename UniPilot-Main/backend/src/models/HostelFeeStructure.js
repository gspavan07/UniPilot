import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const HostelFeeStructure = sequelize.define(
  "HostelFeeStructure",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    room_type: {
      type: DataTypes.ENUM("ac", "non_ac"),
      allowNull: false,
    },
    base_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    security_deposit: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    academic_year: {
      type: DataTypes.STRING,
    },
    semester: {
      type: DataTypes.INTEGER,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "hostel_fee_structures",
    underscored: true,
    timestamps: true,
  },
);

export default HostelFeeStructure;
