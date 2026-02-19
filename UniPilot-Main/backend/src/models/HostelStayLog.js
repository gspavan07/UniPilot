import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const HostelStayLog = sequelize.define(
  "HostelStayLog",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    allocation_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "hostel_allocations",
        key: "id",
      },
    },
    student_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    room_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "hostel_rooms",
        key: "id",
      },
    },
    bed_id: {
      type: DataTypes.UUID,
      references: {
        model: "hostel_beds",
        key: "id",
      },
    },
    check_in_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    check_out_date: {
      type: DataTypes.DATE,
    },
    semester: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    academic_year: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
    },
  },
  {
    tableName: "hostel_stay_logs",
    underscored: true,
    timestamps: true,
  },
);

export default HostelStayLog;
