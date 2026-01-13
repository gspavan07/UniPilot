"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn(
      "fee_waivers",
      "fee_content_id",
      "fee_category_id"
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn(
      "fee_waivers",
      "fee_category_id",
      "fee_content_id"
    );
  },
};
