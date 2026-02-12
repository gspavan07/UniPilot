"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      "placement_drives",
      "external_registration_url",
      {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
    );

    await queryInterface.addColumn("drive_rounds", "venue_type", {
      type: Sequelize.STRING(50),
      allowNull: true,
      defaultValue: "online",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn(
      "placement_drives",
      "external_registration_url",
    );
    await queryInterface.removeColumn("drive_rounds", "venue_type");
  },
};
