"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("hostel_room_bills", "due_date", {
      type: Sequelize.DATEONLY,
      allowNull: true,
      comment: "Payment due date (optional, usually paid with main fees)",
    });
  },

  async down(queryInterface, Sequelize) {
    // Set a default date for any null values before making it NOT NULL
    await queryInterface.sequelize.query(`
      UPDATE hostel_room_bills 
      SET due_date = issue_date + INTERVAL '30 days'
      WHERE due_date IS NULL;
    `);

    await queryInterface.changeColumn("hostel_room_bills", "due_date", {
      type: Sequelize.DATEONLY,
      allowNull: false,
      comment: "Payment due date",
    });
  },
};
