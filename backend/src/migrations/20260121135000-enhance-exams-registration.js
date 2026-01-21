"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add registration fields to exam_cycles
    await queryInterface.addColumn("exam_cycles", "reg_start_date", {
      type: Sequelize.DATEONLY,
      allowNull: true,
    });
    await queryInterface.addColumn("exam_cycles", "reg_end_date", {
      type: Sequelize.DATEONLY,
      allowNull: true,
    });
    await queryInterface.addColumn("exam_cycles", "reg_late_fee_date", {
      type: Sequelize.DATEONLY,
      allowNull: true,
    });
    await queryInterface.addColumn("exam_cycles", "regular_fee", {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0,
    });
    await queryInterface.addColumn("exam_cycles", "supply_fee_per_paper", {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0,
    });
    await queryInterface.addColumn("exam_cycles", "late_fee_amount", {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0,
    });

    // Create exam_registrations table
    await queryInterface.createTable("exam_registrations", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      exam_cycle_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "exam_cycles", key: "id" },
        onDelete: "CASCADE",
      },
      student_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
      },
      registered_subjects: {
        type: Sequelize.JSONB,
        defaultValue: [],
        comment: "Array of course IDs {course_id, type: 'regular'|'supply'}",
      },
      registration_type: {
        type: Sequelize.ENUM("regular", "supply", "combined"),
        defaultValue: "regular",
      },
      fee_status: {
        type: Sequelize.ENUM("pending", "paid", "partially_paid", "waived"),
        defaultValue: "pending",
      },
      total_fee: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
      },
      paid_amount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
      },
      late_fee_paid: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      is_fine_waived: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      attendance_status: {
        type: Sequelize.ENUM("clear", "low", "condoned"),
        defaultValue: "clear",
      },
      attendance_percentage: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      is_condoned: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      override_status: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      override_remarks: {
        type: Sequelize.TEXT,
      },
      status: {
        type: Sequelize.ENUM(
          "draft",
          "submitted",
          "approved",
          "rejected",
          "blocked",
        ),
        defaultValue: "draft",
      },
      hall_ticket_generated: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
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

    // Add unique index for registration
    await queryInterface.addIndex(
      "exam_registrations",
      ["exam_cycle_id", "student_id"],
      {
        unique: true,
        name: "idx_exam_reg_unique_student",
      },
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("exam_registrations");
    await queryInterface.removeColumn("exam_cycles", "reg_start_date");
    await queryInterface.removeColumn("exam_cycles", "reg_end_date");
    await queryInterface.removeColumn("exam_cycles", "reg_late_fee_date");
    await queryInterface.removeColumn("exam_cycles", "regular_fee");
    await queryInterface.removeColumn("exam_cycles", "supply_fee_per_paper");
    await queryInterface.removeColumn("exam_cycles", "late_fee_amount");
  },
};
