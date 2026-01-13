"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("admission_configs", "program_sequences", {
      type: Sequelize.JSONB,
      allowNull: false,
      defaultValue: {},
      comment: "Tracks current sequence number per program ID",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("admission_configs", "program_sequences");
  },
};
