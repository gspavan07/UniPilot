"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Promotion Criteria Table
    await queryInterface.createTable("promotion_criteria", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      program_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "programs", key: "id" },
        onDelete: "CASCADE",
      },
      from_semester: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      to_semester: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      min_attendance_percentage: {
        type: Sequelize.DECIMAL(5, 2),
        defaultValue: 75.0,
      },
      min_cgpa: {
        type: Sequelize.DECIMAL(3, 2),
      },
      max_backlogs_allowed: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      fee_clearance_required: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      library_clearance_required: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
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

    // 2. Promotion Evaluations Table
    await queryInterface.createTable("promotion_evaluations", {
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
      from_semester: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      to_semester: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      evaluation_date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      attendance_percentage: {
        type: Sequelize.DECIMAL(5, 2),
      },
      attendance_met: {
        type: Sequelize.BOOLEAN,
      },
      cgpa: {
        type: Sequelize.DECIMAL(3, 2),
      },
      cgpa_met: {
        type: Sequelize.BOOLEAN,
      },
      backlogs_count: {
        type: Sequelize.INTEGER,
      },
      backlogs_met: {
        type: Sequelize.BOOLEAN,
      },
      fee_cleared: {
        type: Sequelize.BOOLEAN,
      },
      overall_eligible: {
        type: Sequelize.BOOLEAN,
      },
      final_status: {
        type: Sequelize.STRING(50), // PROMOTED, DETAINED, SEMESTER_BACK
      },
      remarks: {
        type: Sequelize.TEXT,
      },
      processed_by: {
        type: Sequelize.UUID,
        references: { model: "users", key: "id" },
        onDelete: "SET NULL",
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

    // 3. Graduations Table
    await queryInterface.createTable("graduations", {
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
      application_date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      graduation_date: {
        type: Sequelize.DATE,
      },
      final_cgpa: {
        type: Sequelize.DECIMAL(3, 2),
      },
      academic_clearance: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      fee_clearance: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      library_clearance: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      status: {
        type: Sequelize.STRING(50), // PENDING, APPROVED, REJECTED, COMPLETED
        defaultValue: "PENDING",
      },
      approved_by: {
        type: Sequelize.UUID,
        references: { model: "users", key: "id" },
        onDelete: "SET NULL",
      },
      remarks: {
        type: Sequelize.TEXT,
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

    // Indexes
    await queryInterface.addIndex(
      "promotion_criteria",
      ["program_id", "from_semester", "to_semester"],
      {
        unique: true,
        name: "idx_promotion_criteria_unique_sem",
      }
    );
    await queryInterface.addIndex("promotion_evaluations", [
      "student_id",
      "from_semester",
    ]);
    await queryInterface.addIndex("graduations", ["student_id"]);
    await queryInterface.addIndex("graduations", ["status"]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("graduations");
    await queryInterface.dropTable("promotion_evaluations");
    await queryInterface.dropTable("promotion_criteria");
  },
};
