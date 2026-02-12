"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("users", "is_lateral", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: "Flag for Lateral Entry students",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("users", "is_lateral");
  },
};
