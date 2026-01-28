"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("hostel_fines", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
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
        comment: "Student who is fined",
      },
      allocation_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "hostel_allocations",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
        comment: "Related hostel allocation",
      },
      fine_type: {
        type: Sequelize.ENUM(
          "damage",
          "disciplinary",
          "late_payment",
          "curfew_violation",
          "other",
        ),
        allowNull: false,
        comment: "Type of fine",
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: "Fine amount in INR",
      },
      reason: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: "Detailed reason for the fine",
      },
      issued_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        defaultValue: Sequelize.NOW,
        comment: "Date when fine was issued",
      },
      due_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        comment: "Payment due date",
      },
      status: {
        type: Sequelize.ENUM("pending", "paid", "waived", "cancelled"),
        allowNull: false,
        defaultValue: "pending",
        comment: "Current status of the fine",
      },
      issued_by: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
        comment: "Admin/staff who issued the fine",
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
    await queryInterface.addIndex("hostel_fines", ["student_id"]);
    await queryInterface.addIndex("hostel_fines", ["status"]);
    await queryInterface.addIndex("hostel_fines", ["fine_type"]);
    await queryInterface.addIndex("hostel_fines", ["issued_date"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("hostel_fines");
  },
};
