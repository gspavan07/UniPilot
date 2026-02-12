"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add fee_charge_id to hostel_fines
    await queryInterface.addColumn("hostel_fines", "fee_charge_id", {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: "student_fee_charges", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
      comment: "Reference to student fee charge for this fine",
    });

    // Add fee_charge_id to student_route_allocations
    await queryInterface.addColumn(
      "student_route_allocations",
      "fee_charge_id",
      {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: "student_fee_charges", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
        comment: "Reference to student fee charge for transport fee",
      },
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("hostel_fines", "fee_charge_id");
    await queryInterface.removeColumn(
      "student_route_allocations",
      "fee_charge_id",
    );
  },
};
