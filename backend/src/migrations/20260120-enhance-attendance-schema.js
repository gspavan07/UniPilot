"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("attendance", "timetable_slot_id", {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: "timetable_slots", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    await queryInterface.addColumn("attendance", "batch_year", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addColumn("attendance", "section", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("attendance", "timetable_slot_id");
    await queryInterface.removeColumn("attendance", "batch_year");
    await queryInterface.removeColumn("attendance", "section");
  },
};
