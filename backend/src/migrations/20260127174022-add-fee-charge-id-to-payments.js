"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("fee_payments", "fee_charge_id", {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: "student_fee_charges", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
      comment: "Reference to student fee charge being paid",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("fee_payments", "fee_charge_id");
  },
};
