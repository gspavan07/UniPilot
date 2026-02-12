"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("users", "is_temporary_id", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: "Flag indicating if the current ID is temporary",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("users", "is_temporary_id");
  },
};
