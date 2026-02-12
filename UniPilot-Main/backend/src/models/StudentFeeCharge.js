const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const StudentFeeCharge = sequelize.define(
  "StudentFeeCharge",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    student_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "users", key: "id" },
      comment: "Student who has this charge",
    },
    category_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "fee_categories", key: "id" },
      comment: "Fee category (e.g., Hostel Electricity, Transport)",
    },
    charge_type: {
      type: DataTypes.ENUM(
        "hostel_bill",
        "transport_fee",
        "fine",
        "other",
      ),
      allowNull: false,
      comment: "Type of individual charge",
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: "Charge amount",
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Detailed description of the charge",
    },
    reference_id: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: "ID of the source record (e.g., hostel_room_bill.id)",
    },
    reference_type: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "Type of source record (e.g., 'hostel_room_bill')",
    },
    semester: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Semester when charge was created",
    },
    academic_year: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: "Academic year (e.g., 2024-2025)",
    },
    is_paid: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: "Whether this charge has been paid",
    },
    paid_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "When the charge was paid",
    },
    payment_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: "fee_payments", key: "id" },
      comment: "Fee payment that settled this charge",
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "users", key: "id" },
      comment: "Admin/staff who created the charge",
    },
  },
  {
    tableName: "student_fee_charges",
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ["student_id"] },
      { fields: ["category_id"] },
      { fields: ["charge_type"] },
      { fields: ["is_paid"] },
      { fields: ["reference_id", "reference_type"] },
    ],
  },
);

module.exports = StudentFeeCharge;
