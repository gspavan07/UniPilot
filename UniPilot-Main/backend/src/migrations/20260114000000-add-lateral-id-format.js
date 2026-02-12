"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("admission_configs", "lateral_id_format", {
      type: Sequelize.STRING(255),
      allowNull: false,
      defaultValue: "L{YY}{UNIV}{BRANCH}{SEQ}", // Default format for Lateral
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("admission_configs", "lateral_id_format");
  },
};
