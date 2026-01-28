"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add rent_fee_charge_id to hostel_allocations
    await queryInterface.addColumn("hostel_allocations", "rent_fee_charge_id", {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: "student_fee_charges", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
      comment: "Reference to student fee charge for hostel rent",
    });

    // Add mess_fee_charge_id to hostel_allocations
    await queryInterface.addColumn("hostel_allocations", "mess_fee_charge_id", {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: "student_fee_charges", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
      comment: "Reference to student fee charge for hostel mess",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn(
      "hostel_allocations",
      "rent_fee_charge_id",
    );
    await queryInterface.removeColumn(
      "hostel_allocations",
      "mess_fee_charge_id",
    );
  },
};
