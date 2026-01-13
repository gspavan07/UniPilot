"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Attendance Table
    await queryInterface.createTable("attendance", {
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
      course_id: {
        type: Sequelize.UUID,
        allowNull: true, // Null for general daily attendance
        references: { model: "courses", key: "id" },
        onDelete: "SET NULL",
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM("present", "absent", "late", "excused"),
        defaultValue: "present",
        allowNull: false,
      },
      remarks: {
        type: Sequelize.TEXT,
      },
      marked_by: {
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

    // 2. Leave Requests Table
    await queryInterface.createTable("leave_requests", {
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
      leave_type: {
        type: Sequelize.STRING(50), // Sick, Personal, Medical, etc.
        allowNull: false,
      },
      start_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      end_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      reason: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM("pending", "approved", "rejected"),
        defaultValue: "pending",
      },
      reviewed_by: {
        type: Sequelize.UUID,
        references: { model: "users", key: "id" },
        onDelete: "SET NULL",
      },
      review_remarks: {
        type: Sequelize.TEXT,
      },
      attachment_url: {
        type: Sequelize.STRING,
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

    // 3. Holidays Table
    await queryInterface.createTable("holidays", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        unique: true,
      },
      type: {
        type: Sequelize.STRING(50), // Public, Institutional, etc.
      },
      description: {
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
      "attendance",
      ["student_id", "date", "course_id"],
      {
        unique: true,
        name: "idx_attendance_unique_entry",
      }
    );
    await queryInterface.addIndex("leave_requests", ["student_id", "status"]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("holidays");
    await queryInterface.dropTable("leave_requests");
    await queryInterface.dropTable("attendance");
  },
};
