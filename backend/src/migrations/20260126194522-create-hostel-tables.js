"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Hostel Buildings
    await queryInterface.createTable("hostel_buildings", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      type: {
        type: Sequelize.ENUM("boys", "girls", "mixed"),
        allowNull: false,
      },
      total_floors: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      total_rooms: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      total_capacity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      address: {
        type: Sequelize.TEXT,
      },
      status: {
        type: Sequelize.ENUM("active", "inactive", "maintenance"),
        defaultValue: "active",
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

    // 2. Hostel Floors
    await queryInterface.createTable("hostel_floors", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      building_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "hostel_buildings",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      floor_number: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      total_rooms: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      occupied_rooms: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
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

    // 3. Hostel Rooms
    await queryInterface.createTable("hostel_rooms", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      building_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "hostel_buildings",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      floor_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "hostel_floors",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      room_number: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      capacity: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      current_occupancy: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      room_type: {
        type: Sequelize.ENUM("ac", "non_ac"),
        defaultValue: "non_ac",
      },
      amenities: {
        type: Sequelize.JSONB,
        defaultValue: {},
        comment: "JSON object: {attached_bathroom: true, balcony: false, etc.}",
      },
      status: {
        type: Sequelize.ENUM("available", "occupied", "maintenance", "full"),
        defaultValue: "available",
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

    // 4. Hostel Beds
    await queryInterface.createTable("hostel_beds", {
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
      },
      bed_number: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM("available", "occupied", "maintenance"),
        defaultValue: "available",
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

    // 5. Hostel Fee Structures
    await queryInterface.createTable("hostel_fee_structures", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      room_type: {
        type: Sequelize.ENUM("ac", "non_ac"),
        allowNull: false,
      },
      mess_type: {
        type: Sequelize.ENUM("veg", "non_veg"),
        allowNull: false,
      },
      hostel_fee: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: "Monthly hostel fee",
      },
      mess_fee: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: "Monthly mess fee",
      },
      security_deposit: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
      },
      academic_year: {
        type: Sequelize.STRING,
      },
      semester: {
        type: Sequelize.INTEGER,
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

    // 6. Hostel Allocations
    await queryInterface.createTable("hostel_allocations", {
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
        references: {
          model: "hostel_beds",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      fee_structure_id: {
        type: Sequelize.UUID,
        references: {
          model: "hostel_fee_structures",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      mess_type: {
        type: Sequelize.ENUM("veg", "non_veg"),
        allowNull: false,
      },
      check_in_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      check_out_date: {
        type: Sequelize.DATE,
      },
      status: {
        type: Sequelize.ENUM("active", "checked_out", "cancelled"),
        defaultValue: "active",
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

    // 7. Hostel Complaints
    await queryInterface.createTable("hostel_complaints", {
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
      },
      room_id: {
        type: Sequelize.UUID,
        references: {
          model: "hostel_rooms",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      complaint_type: {
        type: Sequelize.ENUM(
          "electrical",
          "plumbing",
          "furniture",
          "cleanliness",
          "other",
        ),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      priority: {
        type: Sequelize.ENUM("low", "medium", "high", "urgent"),
        defaultValue: "medium",
      },
      status: {
        type: Sequelize.ENUM("pending", "in_progress", "resolved", "closed"),
        defaultValue: "pending",
      },
      assigned_to: {
        type: Sequelize.UUID,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      resolution_notes: {
        type: Sequelize.TEXT,
      },
      resolved_at: {
        type: Sequelize.DATE,
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

    // 8. Hostel Attendance
    await queryInterface.createTable("hostel_attendance", {
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
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      is_present: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      night_roll_call: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      late_entry: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      late_entry_time: {
        type: Sequelize.TIME,
      },
      remarks: {
        type: Sequelize.TEXT,
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

    // 9. Hostel Gate Passes
    await queryInterface.createTable("hostel_gate_passes", {
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
      },
      out_time: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      expected_return_time: {
        type: Sequelize.DATE,
      },
      actual_return_time: {
        type: Sequelize.DATE,
      },
      purpose: {
        type: Sequelize.STRING,
      },
      destination: {
        type: Sequelize.STRING,
      },
      status: {
        type: Sequelize.ENUM("out", "returned", "late"),
        defaultValue: "out",
      },
      approved_by: {
        type: Sequelize.UUID,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
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

    // 10. Hostel Visitors
    await queryInterface.createTable("hostel_visitors", {
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
      },
      visitor_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      visitor_phone: {
        type: Sequelize.STRING,
      },
      relationship: {
        type: Sequelize.STRING,
      },
      purpose: {
        type: Sequelize.STRING,
      },
      entry_time: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      exit_time: {
        type: Sequelize.DATE,
      },
      id_proof_type: {
        type: Sequelize.STRING,
      },
      id_proof_number: {
        type: Sequelize.STRING,
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

    // Add indexes for better performance
    await queryInterface.addIndex("hostel_rooms", ["building_id", "floor_id"]);
    await queryInterface.addIndex("hostel_rooms", ["status"]);
    await queryInterface.addIndex("hostel_beds", ["room_id", "status"]);
    await queryInterface.addIndex("hostel_allocations", [
      "student_id",
      "status",
    ]);
    await queryInterface.addIndex("hostel_allocations", ["room_id", "status"]);
    await queryInterface.addIndex("hostel_complaints", ["status"]);
    await queryInterface.addIndex("hostel_attendance", ["student_id", "date"]);
    await queryInterface.addIndex("hostel_gate_passes", [
      "student_id",
      "status",
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("hostel_visitors");
    await queryInterface.dropTable("hostel_gate_passes");
    await queryInterface.dropTable("hostel_attendance");
    await queryInterface.dropTable("hostel_complaints");
    await queryInterface.dropTable("hostel_allocations");
    await queryInterface.dropTable("hostel_fee_structures");
    await queryInterface.dropTable("hostel_beds");
    await queryInterface.dropTable("hostel_rooms");
    await queryInterface.dropTable("hostel_floors");
    await queryInterface.dropTable("hostel_buildings");
  },
};
