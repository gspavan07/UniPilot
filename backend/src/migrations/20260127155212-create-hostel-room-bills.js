"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("hostel_room_bills", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      room_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "hostel_rooms",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        comment: "Room for which the bill is generated",
      },
      bill_type: {
        type: Sequelize.ENUM(
          "electricity",
          "water",
          "maintenance",
          "internet",
          "cleaning",
          "other",
        ),
        allowNull: false,
        comment: "Type of utility bill",
      },
      total_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: "Total bill amount in INR",
      },
      billing_period_start: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        comment: "Start date of billing period",
      },
      billing_period_end: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        comment: "End date of billing period",
      },
      issue_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        defaultValue: Sequelize.NOW,
        comment: "Date when bill was issued",
      },
      due_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        comment: "Payment due date",
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: "Additional details about the bill",
      },
      status: {
        type: Sequelize.ENUM("pending", "distributed", "cancelled"),
        allowNull: false,
        defaultValue: "pending",
        comment: "Bill status",
      },
      distributed_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: "Timestamp when bill was distributed to students",
      },
      created_by: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
        comment: "Admin/staff who created the bill",
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
    await queryInterface.addIndex("hostel_room_bills", ["room_id"]);
    await queryInterface.addIndex("hostel_room_bills", ["status"]);
    await queryInterface.addIndex("hostel_room_bills", ["bill_type"]);
    await queryInterface.addIndex("hostel_room_bills", [
      "billing_period_start",
      "billing_period_end",
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("hostel_room_bills");
  },
};
