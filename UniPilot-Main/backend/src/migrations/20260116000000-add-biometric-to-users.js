"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("users", "biometric_device_id", {
      type: Sequelize.STRING(50),
      unique: true,
      allowNull: true,
      comment: "ID used in the physical biometrics device",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("users", "biometric_device_id");
  },
};
