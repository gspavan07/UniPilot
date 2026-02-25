import { DataTypes } from "sequelize";
import { sequelize } from "../../../config/database.js";

/**
 * HostelRoomBillDistribution Model
 * Tracks how room bills are distributed among occupants
 */
const HostelRoomBillDistribution = sequelize.define(
  "HostelRoomBillDistribution",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    room_bill_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "hostel_room_bills",
        key: "id",
      },
      comment: "Related room bill",
    },
    student_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      comment: "Student who receives a share",
    },
    allocation_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "hostel_allocations",
        key: "id",
      },
      comment: "Related allocation record",
    },
    share_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
      comment: "Student's share of the bill in INR",
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
    tableName: "hostel_room_bill_distributions",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ["room_bill_id"],
      },
      {
        fields: ["student_id"],
      },
      {
        fields: ["allocation_id"],
      },
    ],
  },
);

export default HostelRoomBillDistribution;
