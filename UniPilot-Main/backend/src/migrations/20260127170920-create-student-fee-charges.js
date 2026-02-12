"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("student_fee_charges", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      student_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
        comment: "Student who has this charge",
      },
      category_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "fee_categories", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
        comment: "Fee category (e.g., Hostel Electricity, Transport)",
      },
      charge_type: {
        type: Sequelize.ENUM("hostel_bill", "transport_fee", "fine", "other"),
        allowNull: false,
        comment: "Type of individual charge",
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: "Charge amount",
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: "Detailed description of the charge",
      },
      reference_id: {
        type: Sequelize.UUID,
        allowNull: true,
        comment: "ID of the source record (e.g., hostel_room_bill.id)",
      },
      reference_type: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: "Type of source record (e.g., hostel_room_bill)",
      },
      semester: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: "Semester when charge was created",
      },
      academic_year: {
        type: Sequelize.STRING(20),
        allowNull: true,
        comment: "Academic year (e.g., 2024-2025)",
      },
      is_paid: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: "Whether this charge has been paid",
      },
      paid_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: "When the charge was paid",
      },
      payment_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: "fee_payments", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
        comment: "Fee payment that settled this charge",
      },
      created_by: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
        comment: "Admin/staff who created the charge",
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    // Add indexes
    await queryInterface.addIndex("student_fee_charges", ["student_id"]);
    await queryInterface.addIndex("student_fee_charges", ["category_id"]);
    await queryInterface.addIndex("student_fee_charges", ["charge_type"]);
    await queryInterface.addIndex("student_fee_charges", ["is_paid"]);
    await queryInterface.addIndex("student_fee_charges", [
      "reference_id",
      "reference_type",
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("student_fee_charges");
  },
};
