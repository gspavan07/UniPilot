"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("exam_scripts", {
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
      file_path: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      file_size: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      uploaded_by: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "SET NULL",
      },
      uploaded_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false,
      },
      is_visible: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      view_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      last_viewed_at: {
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

    // Add indexes
    await queryInterface.addIndex("exam_scripts", ["exam_schedule_id"]);
    await queryInterface.addIndex("exam_scripts", ["student_id"]);
    await queryInterface.addIndex("exam_scripts", ["is_visible"]);

    // Unique constraint: one script per student per exam schedule
    await queryInterface.addIndex(
      "exam_scripts",
      ["student_id", "exam_schedule_id"],
      {
        unique: true,
        name: "idx_exam_scripts_unique_entry",
      },
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("exam_scripts");
  },
};
