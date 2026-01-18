"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      "institution_settings",
      "current_admission_sequence",
      {
        type: Sequelize.INTEGER,
        defaultValue: 1,
        allowNull: false,
      }
    );
    await queryInterface.addColumn(
      "institution_settings",
      "admission_number_prefix",
      {
        type: Sequelize.STRING,
        defaultValue: "ADM",
        allowNull: false,
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn(
      "institution_settings",
      "current_admission_sequence"
    );
    await queryInterface.removeColumn(
      "institution_settings",
      "admission_number_prefix"
    );
  },
};
