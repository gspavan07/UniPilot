"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("hostel_room_bill_distributions", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      room_bill_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "hostel_room_bills",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        comment: "Related room bill",
      },
      student_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        comment: "Student who receives a share",
      },
      allocation_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "hostel_allocations",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        comment: "Related allocation record",
      },
      share_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: "Student's share of the bill in INR",
      },
      fee_structure_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "fee_structures",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
        comment: "Linked fee structure entry",
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    // Add indexes
    await queryInterface.addIndex("hostel_room_bill_distributions", [
      "room_bill_id",
    ]);
    await queryInterface.addIndex("hostel_room_bill_distributions", [
      "student_id",
    ]);
    await queryInterface.addIndex("hostel_room_bill_distributions", [
      "allocation_id",
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("hostel_room_bill_distributions");
  },
};
