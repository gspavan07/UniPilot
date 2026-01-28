"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("hostel_stay_logs", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
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
      },
      bed_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "hostel_beds",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      check_in_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      check_out_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      semester: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      academic_year: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
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

    // Add index for performance
    await queryInterface.addIndex("hostel_stay_logs", ["allocation_id"]);
    await queryInterface.addIndex("hostel_stay_logs", ["student_id"]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("hostel_stay_logs");
  },
};
