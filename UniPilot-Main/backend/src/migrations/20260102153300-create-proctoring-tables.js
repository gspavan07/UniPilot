"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Proctor Assignments Table
    await queryInterface.createTable("proctor_assignments", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      proctor_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      student_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      department_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "departments", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      assignment_type: {
        type: Sequelize.STRING(50),
        defaultValue: "ACADEMIC",
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      end_date: {
        type: Sequelize.DATE,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      assigned_by: {
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

    // 2. Proctor Sessions Table
    await queryInterface.createTable("proctor_sessions", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      assignment_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "proctor_assignments", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      session_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      session_type: {
        type: Sequelize.STRING(50), // ONE_ON_ONE, GROUP, ONLINE
      },
      duration_minutes: {
        type: Sequelize.INTEGER,
      },
      location: {
        type: Sequelize.STRING(200),
      },
      agenda: {
        type: Sequelize.TEXT,
      },
      notes: {
        type: Sequelize.TEXT,
      },
      attendance_status: {
        type: Sequelize.STRING(20), // SCHEDULED, COMPLETED, CANCELLED, NO_SHOW
        defaultValue: "SCHEDULED",
      },
      created_by: {
        type: Sequelize.UUID,
        allowNull: false,
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

    // 3. Proctor Feedback Table
    await queryInterface.createTable("proctor_feedback", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      assignment_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "proctor_assignments", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      session_id: {
        type: Sequelize.UUID,
        references: { model: "proctor_sessions", key: "id" },
        onDelete: "SET NULL",
      },
      feedback_text: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      feedback_category: {
        type: Sequelize.STRING(50), // ACADEMIC, BEHAVIORAL, ATTENDANCE, CAREER
      },
      severity: {
        type: Sequelize.STRING(20), // POSITIVE, NEUTRAL, CONCERN, CRITICAL
        defaultValue: "NEUTRAL",
      },
      is_visible_to_student: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      is_visible_to_parent: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      created_by: {
        type: Sequelize.UUID,
        allowNull: false,
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

    // 4. Proctor Alerts Table
    await queryInterface.createTable("proctor_alerts", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      proctor_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
      },
      student_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
      },
      alert_type: {
        type: Sequelize.STRING(50), // LOW_ATTENDANCE, FAILING_GRADES, NO_FEE_PAYMENT
        allowNull: false,
      },
      alert_message: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      severity: {
        type: Sequelize.STRING(20), // INFO, WARNING, CRITICAL
        defaultValue: "INFO",
      },
      is_read: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      triggered_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      read_at: {
        type: Sequelize.DATE,
      },
    });

    // Add Indexes
    await queryInterface.addIndex("proctor_assignments", [
      "proctor_id",
      "is_active",
    ]);
    await queryInterface.addIndex("proctor_assignments", [
      "student_id",
      "is_active",
    ]);
    await queryInterface.addIndex("proctor_sessions", ["assignment_id"]);
    await queryInterface.addIndex("proctor_feedback", ["assignment_id"]);
    await queryInterface.addIndex("proctor_alerts", ["proctor_id", "is_read"]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("proctor_alerts");
    await queryInterface.dropTable("proctor_feedback");
    await queryInterface.dropTable("proctor_sessions");
    await queryInterface.dropTable("proctor_assignments");
  },
};
