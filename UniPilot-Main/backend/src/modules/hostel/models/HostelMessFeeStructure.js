import { DataTypes } from "sequelize";
import { sequelize } from "../../../config/database.js";

const HostelMessFeeStructure = sequelize.define(
  "HostelMessFeeStructure",
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
    mess_type: {
      type: DataTypes.ENUM("veg", "non_veg"),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    academic_year: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "hostel_mess_fee_structures",
    schema: 'hostel',
    underscored: true,
    timestamps: true,
  },
);

export default HostelMessFeeStructure;
