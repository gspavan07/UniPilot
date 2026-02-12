"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Timetables (Header)
    await queryInterface.createTable("timetables", {
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
      semester: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      academic_year: {
        type: Sequelize.STRING,
        allowNull: false, // e.g. "2025-2026"
      },
      section: {
        type: Sequelize.STRING, // Optional: "A", "B", etc.
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      created_by: {
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

    // 2. Timetable Slots (Details)
    await queryInterface.createTable("timetable_slots", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      timetable_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "timetables", key: "id" },
        onDelete: "CASCADE",
      },
      course_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "courses", key: "id" },
        onDelete: "CASCADE",
      },
      faculty_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
      },
      day_of_week: {
        type: Sequelize.ENUM(
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday"
        ),
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
      room_number: {
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
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("timetable_slots");
    await queryInterface.dropTable("timetables");
  },
};
