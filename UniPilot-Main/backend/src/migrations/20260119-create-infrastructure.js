"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Create Blocks Table
    await queryInterface.createTable("blocks", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      code: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true,
      },
      type: {
        type: Sequelize.ENUM("academic", "administrative", "hostel", "other"),
        defaultValue: "academic",
      },
      description: {
        type: Sequelize.TEXT,
      },
      total_floors: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
      },
      image_url: {
        type: Sequelize.STRING,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // 2. Create Rooms Table
    await queryInterface.createTable("rooms", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      block_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "blocks",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      room_number: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING, // e.g. "Chemistry Lab", "Seminar Hall A"
        allowNull: true,
      },
      floor_number: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      type: {
        type: Sequelize.ENUM(
          "classroom",
          "lab",
          "seminar_hall",
          "staff_room",
          "auditorium",
          "utility",
        ),
        defaultValue: "classroom",
      },

      // Capacity Planning
      capacity: {
        type: Sequelize.INTEGER,
        defaultValue: 30,
        comment: "Regular class capacity",
      },
      exam_capacity: {
        type: Sequelize.INTEGER,
        defaultValue: 15,
        comment: "Spaced out seating capacity for exams",
      },

      // Future Proofing for Auto-Seating
      seating_config: {
        type: Sequelize.JSONB, // { rows: 5, cols: 6, pattern: 'standard' }
        allowNull: true,
        comment: "Grid configuration for auto-seating algorithms",
      },

      facilities: {
        type: Sequelize.JSONB, // ["Projector", "AC", "Smart Board"]
        defaultValue: [],
      },

      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // Add unique constraint per block for room number (Room 101 can exist in Block A and Block B)
    await queryInterface.addConstraint("rooms", {
      fields: ["block_id", "room_number"],
      type: "unique",
      name: "unique_room_per_block",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("rooms");
    await queryInterface.dropTable("blocks");
  },
};
