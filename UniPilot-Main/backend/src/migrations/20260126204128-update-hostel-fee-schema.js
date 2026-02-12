"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Update hostel_fee_structures
    // Rename hostel_fee to base_amount
    await queryInterface.renameColumn(
      "hostel_fee_structures",
      "hostel_fee",
      "base_amount",
    );
    // Remove mess_fee and mess_type (moved to separate table)
    await queryInterface.removeColumn("hostel_fee_structures", "mess_fee");
    await queryInterface.removeColumn("hostel_fee_structures", "mess_type");

    // 2. Create hostel_mess_fee_structures table
    await queryInterface.createTable("hostel_mess_fee_structures", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      mess_type: {
        type: Sequelize.ENUM("veg", "non_veg"),
        allowNull: false,
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      academic_year: {
        type: Sequelize.STRING,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
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

    // 3. Update hostel_allocations
    // Add mess_fee_structure_id
    await queryInterface.addColumn(
      "hostel_allocations",
      "mess_fee_structure_id",
      {
        type: Sequelize.UUID,
        references: {
          model: "hostel_mess_fee_structures",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
    );
    // Remove mess_type (now linked via plan)
    await queryInterface.removeColumn("hostel_allocations", "mess_type");

    // Add linkage to main fee system
    await queryInterface.addColumn("hostel_allocations", "rent_fee_id", {
      type: Sequelize.UUID,
      references: {
        model: "fee_structures",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
    await queryInterface.addColumn("hostel_allocations", "mess_fee_id", {
      type: Sequelize.UUID,
      references: {
        model: "fee_structures",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
    await queryInterface.addColumn("hostel_allocations", "semester", {
      type: Sequelize.INTEGER,
      allowNull: true, // Allow null for existing records if any
    });
    await queryInterface.addColumn("hostel_allocations", "academic_year", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    // Reverse changes (approximate)
    await queryInterface.renameColumn(
      "hostel_fee_structures",
      "base_amount",
      "hostel_fee",
    );
    await queryInterface.addColumn("hostel_fee_structures", "mess_fee", {
      type: Sequelize.DECIMAL(10, 2),
    });
    await queryInterface.addColumn("hostel_fee_structures", "mess_type", {
      type: Sequelize.ENUM("veg", "non_veg"),
    });

    await queryInterface.dropTable("hostel_mess_fee_structures");

    await queryInterface.removeColumn(
      "hostel_allocations",
      "mess_fee_structure_id",
    );
    await queryInterface.addColumn("hostel_allocations", "mess_type", {
      type: Sequelize.ENUM("veg", "non_veg"),
    });
    await queryInterface.removeColumn("hostel_allocations", "rent_fee_id");
    await queryInterface.removeColumn("hostel_allocations", "mess_fee_id");
    await queryInterface.removeColumn("hostel_allocations", "semester");
    await queryInterface.removeColumn("hostel_allocations", "academic_year");
  },
};
