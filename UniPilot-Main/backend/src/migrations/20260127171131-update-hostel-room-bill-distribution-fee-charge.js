"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add new fee_charge_id column
    await queryInterface.addColumn(
      "hostel_room_bill_distributions",
      "fee_charge_id",
      {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: "student_fee_charges", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
        comment: "Reference to student fee charge",
      },
    );

    // Make fee_structure_id nullable (for backwards compatibility)
    await queryInterface.changeColumn(
      "hostel_room_bill_distributions",
      "fee_structure_id",
      {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: "fee_structures", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn(
      "hostel_room_bill_distributions",
      "fee_charge_id",
    );

    // Restore fee_structure_id as NOT NULL
    await queryInterface.changeColumn(
      "hostel_room_bill_distributions",
      "fee_structure_id",
      {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "fee_structures", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
    );
  },
};
