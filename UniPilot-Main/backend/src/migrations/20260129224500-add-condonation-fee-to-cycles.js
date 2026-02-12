"use strict";

const { QueryTypes } = require("sequelize");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable("exam_cycles");
    if (!tableInfo.condonation_fee) {
      await queryInterface.addColumn("exam_cycles", "condonation_fee", {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.0,
        allowNull: false,
        comment: "Fee charged for attendance condonation",
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable("exam_cycles");
    if (tableInfo.condonation_fee) {
      await queryInterface.removeColumn("exam_cycles", "condonation_fee");
    }
  },
};
