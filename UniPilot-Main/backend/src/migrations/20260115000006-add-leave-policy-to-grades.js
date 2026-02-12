"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("salary_grades", "leave_policy", {
      type: Sequelize.JSONB,
      defaultValue: [],
      comment: "Leave entitlements: [{name, days, carry_forward}]",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("salary_grades", "leave_policy");
  },
};
