"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Exam Cycles Table
    await queryInterface.createTable("exam_cycles", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false, // e.g., "Odd Semester Exam 2026"
      },
      start_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      end_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM(
          "scheduled",
          "ongoing",
          "completed",
          "results_published"
        ),
        defaultValue: "scheduled",
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

    // 2. Exam Schedules (Time Table)
    await queryInterface.createTable("exam_schedules", {
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
      course_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "courses", key: "id" },
        onDelete: "CASCADE",
      },
      exam_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      start_time: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      end_time: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      venue: {
        type: Sequelize.STRING, // Room No / Block
      },
      max_marks: {
        type: Sequelize.INTEGER,
        defaultValue: 100,
      },
      passing_marks: {
        type: Sequelize.INTEGER,
        defaultValue: 35,
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

    // 3. Exam Marks Table
    await queryInterface.createTable("exam_marks", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      exam_schedule_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "exam_schedules", key: "id" },
        onDelete: "CASCADE",
      },
      student_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
      },
      marks_obtained: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      grade: {
        type: Sequelize.STRING(5), // A+, B, etc.
      },
      status: {
        type: Sequelize.ENUM("present", "absent", "malpractice"),
        defaultValue: "present",
      },
      remarks: {
        type: Sequelize.TEXT,
      },
      entered_by: {
        type: Sequelize.UUID,
        references: { model: "users", key: "id" },
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

    // 4. Hall Tickets Table
    await queryInterface.createTable("hall_tickets", {
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
      ticket_number: {
        type: Sequelize.STRING,
        unique: true,
      },
      download_status: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      is_blocked: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      block_reason: {
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
      "exam_marks",
      ["exam_schedule_id", "student_id"],
      {
        unique: true,
        name: "idx_exam_marks_unique_entry",
      }
    );
    await queryInterface.addIndex(
      "hall_tickets",
      ["exam_cycle_id", "student_id"],
      {
        unique: true,
        name: "idx_hall_ticket_unique_entry",
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("hall_tickets");
    await queryInterface.dropTable("exam_marks");
    await queryInterface.dropTable("exam_schedules");
    await queryInterface.dropTable("exam_cycles");
  },
};
