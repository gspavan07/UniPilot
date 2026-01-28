"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add new columns
    await queryInterface.addColumn("hostel_room_bills", "billing_month", {
      type: Sequelize.INTEGER,
      allowNull: true, // Allow null initially for existing records
      comment: "Billing month (1-12)",
    });

    await queryInterface.addColumn("hostel_room_bills", "billing_year", {
      type: Sequelize.INTEGER,
      allowNull: true, // Allow null initially for existing records
      comment: "Billing year",
    });

    // Migrate existing data: extract month and year from billing_period_start
    await queryInterface.sequelize.query(`
      UPDATE hostel_room_bills 
      SET 
        billing_month = EXTRACT(MONTH FROM billing_period_start)::INTEGER,
        billing_year = EXTRACT(YEAR FROM billing_period_start)::INTEGER
      WHERE billing_period_start IS NOT NULL;
    `);

    // Now make them NOT NULL
    await queryInterface.changeColumn("hostel_room_bills", "billing_month", {
      type: Sequelize.INTEGER,
      allowNull: false,
      comment: "Billing month (1-12)",
    });

    await queryInterface.changeColumn("hostel_room_bills", "billing_year", {
      type: Sequelize.INTEGER,
      allowNull: false,
      comment: "Billing year",
    });

    // Remove old columns
    await queryInterface.removeColumn(
      "hostel_room_bills",
      "billing_period_start",
    );
    await queryInterface.removeColumn(
      "hostel_room_bills",
      "billing_period_end",
    );
  },

  async down(queryInterface, Sequelize) {
    // Add back old columns
    await queryInterface.addColumn(
      "hostel_room_bills",
      "billing_period_start",
      {
        type: Sequelize.DATEONLY,
        allowNull: true,
        comment: "Start date of billing period",
      },
    );

    await queryInterface.addColumn("hostel_room_bills", "billing_period_end", {
      type: Sequelize.DATEONLY,
      allowNull: true,
      comment: "End date of billing period",
    });

    // Migrate data back: create date from month and year
    await queryInterface.sequelize.query(`
      UPDATE hostel_room_bills 
      SET 
        billing_period_start = make_date(billing_year, billing_month, 1),
        billing_period_end = (make_date(billing_year, billing_month, 1) + INTERVAL '1 month - 1 day')::DATE
      WHERE billing_month IS NOT NULL AND billing_year IS NOT NULL;
    `);

    // Remove new columns
    await queryInterface.removeColumn("hostel_room_bills", "billing_month");
    await queryInterface.removeColumn("hostel_room_bills", "billing_year");
  },
};
