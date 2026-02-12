"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("salary_grades", "lop_config", {
      type: Sequelize.JSONB,
      defaultValue: { basis: "basic", deduction_factor: 1.0 },
      comment:
        "Loss of Pay rules: {basis: 'basic'|'gross', deduction_factor: 1.0}",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("salary_grades", "lop_config");
  },
};
