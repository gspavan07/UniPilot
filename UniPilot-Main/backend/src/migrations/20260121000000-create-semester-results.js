"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("semester_results", {
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
        onDelete: "CASCADE",
      },
      semester: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      batch_year: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      sgpa: {
        type: Sequelize.DECIMAL(4, 2),
        allowNull: false,
      },
      total_credits: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      earned_credits: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      exam_cycle_id: {
        type: Sequelize.UUID,
        references: { model: "exam_cycles", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      published_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      published_by: {
        type: Sequelize.UUID,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
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

    // Composite unique index to avoid duplicate results for same student/semester/batch
    await queryInterface.addConstraint("semester_results", {
      fields: ["student_id", "semester", "batch_year"],
      type: "unique",
      name: "unique_semester_result_per_student",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("semester_results");
  },
};
