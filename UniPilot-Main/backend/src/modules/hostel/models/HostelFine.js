import { DataTypes } from "sequelize";
import { sequelize } from "../../../config/database.js";

/**
 * HostelFine Model
 * Tracks individual fines issued to hostel students
 */
const HostelFine = sequelize.define(
  "HostelFine",
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
      comment: "Student who is fined",
    },
    allocation_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "hostel_allocations",
        key: "id",
      },
      comment: "Related hostel allocation",
    },
    fine_type: {
      type: DataTypes.ENUM(
        "damage",
        "disciplinary",
        "late_payment",
        "curfew_violation",
        "other",
      ),
      allowNull: false,
      comment: "Type of fine",
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
      comment: "Fine amount in INR",
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "Detailed reason for the fine",
    },
    issued_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: "Date when fine was issued",
    },
    due_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: "Payment due date",
    },
    status: {
      type: DataTypes.ENUM("pending", "paid", "waived", "cancelled"),
      allowNull: false,
      defaultValue: "pending",
      comment: "Current status of the fine",
    },
    issued_by: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      comment: "Admin/staff who issued the fine",
    },
    fee_structure_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "fee_structures",
        key: "id",
      },
      comment: "Legacy: Linked fee structure entry",
    },
    fee_charge_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "student_fee_charges",
        key: "id",
      },
      comment: "Linked student fee charge entry",
    },
  },
  {
    tableName: "hostel_fines",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ["student_id"],
      },
      {
        fields: ["status"],
      },
      {
        fields: ["fine_type"],
      },
      {
        fields: ["issued_date"],
      },
    ],
  },
);

export default HostelFine;
