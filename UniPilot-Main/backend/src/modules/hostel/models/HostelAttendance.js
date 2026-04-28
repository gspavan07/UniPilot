import { DataTypes } from "sequelize";
import { sequelize } from "../../../config/database.js";

const HostelAttendance = sequelize.define(
  "HostelAttendance",
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
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    is_present: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    night_roll_call: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    late_entry: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    late_entry_time: {
      type: DataTypes.TIME,
    },
    remarks: {
      type: DataTypes.TEXT,
    },
  },
  {
    tableName: "hostel_attendance",
    schema: 'hostel',
    underscored: true,
    timestamps: true,
  },
);

export default HostelAttendance;
