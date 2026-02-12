"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("exam_reverifications", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      student_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
      },
      exam_schedule_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "exam_schedules", key: "id" },
        onDelete: "CASCADE",
      },
      exam_mark_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "exam_marks", key: "id" },
        onDelete: "CASCADE",
      },
      original_marks: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
      },
      revised_marks: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM(
          "pending",
          "under_review",
          "completed",
          "rejected",
        ),
        defaultValue: "pending",
        allowNull: false,
      },
      payment_status: {
        type: Sequelize.ENUM("pending", "paid", "waived"),
        defaultValue: "pending",
        allowNull: false,
      },
      fee_charge_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: "student_fee_charges", key: "id" },
        onDelete: "SET NULL",
      },
      reason: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      remarks: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      reviewed_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: "users", key: "id" },
        onDelete: "SET NULL",
      },
      reviewed_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // Add indexes for better query performance
    await queryInterface.addIndex("exam_reverifications", ["student_id"]);
    await queryInterface.addIndex("exam_reverifications", ["exam_schedule_id"]);
    await queryInterface.addIndex("exam_reverifications", ["status"]);
    await queryInterface.addIndex("exam_reverifications", ["payment_status"]);
    await queryInterface.addIndex("exam_reverifications", ["created_at"]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("exam_reverifications");
  },
};
