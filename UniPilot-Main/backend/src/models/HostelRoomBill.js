import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

/**
 * HostelRoomBill Model
 * Tracks utility bills for hostel rooms (electricity, water, etc.)
 */
const HostelRoomBill = sequelize.define(
  "HostelRoomBill",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    room_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "hostel_rooms",
        key: "id",
      },
      comment: "Room for which the bill is generated",
    },
    bill_type: {
      type: DataTypes.ENUM(
        "electricity",
        "water",
        "maintenance",
        "internet",
        "cleaning",
        "other",
      ),
      allowNull: false,
      comment: "Type of utility bill",
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
      comment: "Total bill amount in INR",
    },
    billing_month: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 12,
      },
      comment: "Billing month (1-12)",
    },
    billing_year: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 2000,
        max: 2100,
      },
      comment: "Billing year",
    },
    issue_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: "Date when bill was issued",
    },
    due_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: "Payment due date (optional, usually paid with main fees)",
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Additional details about the bill",
    },
    status: {
      type: DataTypes.ENUM("pending", "distributed", "cancelled"),
      allowNull: false,
      defaultValue: "pending",
      comment: "Bill status",
    },
    distributed_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Timestamp when bill was distributed to students",
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      comment: "Admin/staff who created the bill",
    },
  },
  {
    tableName: "hostel_room_bills",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ["room_id"],
      },
      {
        fields: ["status"],
      },
      {
        fields: ["bill_type"],
      },
      {
        fields: ["billing_period_start", "billing_period_end"],
      },
    ],
  },
);

export default HostelRoomBill;
