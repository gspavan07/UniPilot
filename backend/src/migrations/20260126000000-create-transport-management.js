"use strict";

/**
 * Migration: Create Transport Management Tables
 * Creates all tables needed for the transport management module
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Create transport_routes table
    await queryInterface.createTable("transport_routes", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: "Route name (e.g., Route 1 - Kakinada)",
      },
      route_code: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true,
        comment: "Unique route code (e.g., R001)",
      },
      distance_km: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: "Total distance in kilometers",
      },
      start_location: {
        type: Sequelize.STRING(200),
        allowNull: false,
        comment: "Starting point of the route",
      },
      end_location: {
        type: Sequelize.STRING(200),
        allowNull: false,
        defaultValue: "University Campus",
        comment: "Ending point (usually university)",
      },
      description: {
        type: Sequelize.TEXT,
        comment: "Additional route details",
      },
      morning_start_time: {
        type: Sequelize.TIME,
        comment: "Morning trip start time",
      },
      evening_start_time: {
        type: Sequelize.TIME,
        comment: "Evening trip start time",
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        comment: "Whether route is currently operational",
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.addIndex("transport_routes", ["route_code"], {
      unique: true,
    });
    await queryInterface.addIndex("transport_routes", ["is_active"]);

    // 2. Create transport_stops table
    await queryInterface.createTable("transport_stops", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      route_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "transport_routes",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      stop_name: {
        type: Sequelize.STRING(200),
        allowNull: false,
        comment: "Name of the stop (e.g., Gandhinagar Circle)",
      },
      stop_sequence: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: "Order of stop on the route (1, 2, 3...)",
      },
      distance_from_start_km: {
        type: Sequelize.DECIMAL(10, 2),
        comment: "Distance from route start in km",
      },
      zone_fee: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: "Transport fee for this stop/zone",
      },
      morning_pickup_time: {
        type: Sequelize.TIME,
        comment: "Estimated morning pickup time",
      },
      evening_drop_time: {
        type: Sequelize.TIME,
        comment: "Estimated evening drop time",
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        comment: "Whether stop is currently in use",
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.addIndex("transport_stops", ["route_id"]);
    await queryInterface.addIndex("transport_stops", ["stop_sequence"]);
    await queryInterface.addIndex("transport_stops", ["is_active"]);

    // 3. Create transport_vehicles table
    await queryInterface.createTable("transport_vehicles", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      registration_number: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
        comment: "Vehicle registration number",
      },
      vehicle_type: {
        type: Sequelize.ENUM("bus", "van", "minibus"),
        allowNull: false,
        defaultValue: "bus",
      },
      seating_capacity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: "Total seats available",
      },
      make_model: {
        type: Sequelize.STRING(100),
        comment: "Manufacturer and model (e.g., Tata Starbus)",
      },
      year_of_manufacture: {
        type: Sequelize.INTEGER,
        comment: "Manufacturing year",
      },
      insurance_number: {
        type: Sequelize.STRING(100),
        comment: "Insurance policy number",
      },
      insurance_expiry: {
        type: Sequelize.DATEONLY,
        comment: "Insurance expiry date",
      },
      fitness_certificate_expiry: {
        type: Sequelize.DATEONLY,
        comment: "Fitness certificate expiry date",
      },
      rc_book_number: {
        type: Sequelize.STRING(100),
        comment: "Registration certificate number",
      },
      current_mileage: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
        comment: "Current odometer reading in km",
      },
      status: {
        type: Sequelize.ENUM("active", "maintenance", "retired"),
        defaultValue: "active",
        comment: "Operational status",
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.addIndex(
      "transport_vehicles",
      ["registration_number"],
      {
        unique: true,
      },
    );
    await queryInterface.addIndex("transport_vehicles", ["status"]);
    await queryInterface.addIndex("transport_vehicles", ["is_active"]);

    // 4. Create transport_drivers table
    await queryInterface.createTable("transport_drivers", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      first_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      last_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(255),
      },
      driver_license_number: {
        type: Sequelize.STRING(50),
        unique: true,
        comment: "Driving license number",
      },
      license_expiry: {
        type: Sequelize.DATEONLY,
        comment: "License expiry date",
      },
      address: {
        type: Sequelize.TEXT,
        comment: "Residential address",
      },
      date_of_birth: {
        type: Sequelize.DATEONLY,
      },
      date_of_joining: {
        type: Sequelize.DATEONLY,
        comment: "Date of joining as transport staff",
      },
      staff_type: {
        type: Sequelize.ENUM("driver", "conductor", "helper"),
        allowNull: false,
        defaultValue: "driver",
        comment: "Type of transport staff",
      },
      emergency_contact_name: {
        type: Sequelize.STRING(100),
        comment: "Emergency contact person name",
      },
      emergency_contact_phone: {
        type: Sequelize.STRING(20),
        comment: "Emergency contact phone",
      },
      is_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: "Background verification status",
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.addIndex(
      "transport_drivers",
      ["driver_license_number"],
      {
        unique: true,
        where: {
          driver_license_number: {
            [Sequelize.Op.ne]: null,
          },
        },
      },
    );
    await queryInterface.addIndex("transport_drivers", ["staff_type"]);
    await queryInterface.addIndex("transport_drivers", ["is_active"]);

    // 5. Create vehicle_route_assignments table
    await queryInterface.createTable("vehicle_route_assignments", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      vehicle_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "transport_vehicles",
          key: "id",
        },
      },
      route_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "transport_routes",
          key: "id",
        },
      },
      driver_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "transport_drivers",
          key: "id",
        },
        comment: "Primary driver for this route",
      },
      conductor_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "transport_drivers",
          key: "id",
        },
        comment: "Conductor/helper (optional)",
      },
      shift_type: {
        type: Sequelize.ENUM("morning", "evening", "both"),
        allowNull: false,
        defaultValue: "both",
        comment: "Which shift this assignment covers",
      },
      assigned_from: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        defaultValue: Sequelize.NOW,
        comment: "Assignment start date",
      },
      assigned_to: {
        type: Sequelize.DATEONLY,
        comment: "Assignment end date (null if ongoing)",
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.addIndex("vehicle_route_assignments", ["vehicle_id"]);
    await queryInterface.addIndex("vehicle_route_assignments", ["route_id"]);
    await queryInterface.addIndex("vehicle_route_assignments", ["driver_id"]);
    await queryInterface.addIndex("vehicle_route_assignments", ["is_active"]);

    // 6. Create student_route_allocations table
    await queryInterface.createTable("student_route_allocations", {
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
        comment: "Student allocated to transport",
      },
      route_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "transport_routes",
          key: "id",
        },
      },
      stop_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "transport_stops",
          key: "id",
        },
        comment: "Pickup/drop stop",
      },
      academic_year: {
        type: Sequelize.STRING(20),
        allowNull: false,
        comment: "Academic year (e.g., 2024-2025)",
      },
      semester: {
        type: Sequelize.INTEGER,
        comment: "Semester number",
      },
      status: {
        type: Sequelize.ENUM("active", "suspended", "cancelled"),
        defaultValue: "active",
      },
      allocated_date: {
        type: Sequelize.DATEONLY,
        defaultValue: Sequelize.NOW,
      },
      fee_structure_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "fee_structures",
          key: "id",
        },
        comment: "Linked fee structure entry for transport fee",
      },
      remarks: {
        type: Sequelize.TEXT,
        comment: "Additional notes",
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.addIndex("student_route_allocations", ["student_id"]);
    await queryInterface.addIndex("student_route_allocations", ["route_id"]);
    await queryInterface.addIndex("student_route_allocations", ["stop_id"]);
    await queryInterface.addIndex("student_route_allocations", ["status"]);
    await queryInterface.addIndex("student_route_allocations", [
      "academic_year",
    ]);

    // 7. Create special_trips table
    await queryInterface.createTable("special_trips", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      trip_name: {
        type: Sequelize.STRING(200),
        allowNull: false,
        comment: "Trip purpose (e.g., Industrial Visit - CSE)",
      },
      trip_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      vehicle_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "transport_vehicles",
          key: "id",
        },
      },
      driver_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "transport_drivers",
          key: "id",
        },
      },
      destination: {
        type: Sequelize.STRING(200),
        allowNull: false,
        comment: "Destination location",
      },
      departure_time: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      return_time: {
        type: Sequelize.TIME,
        comment: "Expected return time",
      },
      purpose: {
        type: Sequelize.TEXT,
        comment: "Detailed purpose of the trip",
      },
      requested_by: {
        type: Sequelize.UUID,
        references: {
          model: "users",
          key: "id",
        },
        comment: "User who requested the trip",
      },
      approved_by: {
        type: Sequelize.UUID,
        references: {
          model: "users",
          key: "id",
        },
        comment: "Transport admin who approved",
      },
      status: {
        type: Sequelize.ENUM("pending", "approved", "completed", "cancelled"),
        defaultValue: "pending",
      },
      total_passengers: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: "Number of passengers",
      },
      remarks: {
        type: Sequelize.TEXT,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.addIndex("special_trips", ["trip_date"]);
    await queryInterface.addIndex("special_trips", ["vehicle_id"]);
    await queryInterface.addIndex("special_trips", ["status"]);

    // 8. Create trip_logs table
    await queryInterface.createTable("trip_logs", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      vehicle_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "transport_vehicles",
          key: "id",
        },
      },
      route_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "transport_routes",
          key: "id",
        },
        comment: "Route covered (nullable for special trips)",
      },
      driver_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "transport_drivers",
          key: "id",
        },
      },
      trip_type: {
        type: Sequelize.ENUM("regular_morning", "regular_evening", "special"),
        allowNull: false,
        defaultValue: "regular_morning",
      },
      trip_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      start_time: {
        type: Sequelize.TIME,
        allowNull: false,
        comment: "Actual start time",
      },
      end_time: {
        type: Sequelize.TIME,
        comment: "Actual end time",
      },
      start_mileage: {
        type: Sequelize.DECIMAL(10, 2),
        comment: "Odometer at start",
      },
      end_mileage: {
        type: Sequelize.DECIMAL(10, 2),
        comment: "Odometer at end",
      },
      distance_covered: {
        type: Sequelize.DECIMAL(10, 2),
        comment: "Calculated distance in km",
      },
      fuel_consumed: {
        type: Sequelize.DECIMAL(10, 2),
        comment: "Fuel consumption in liters",
      },
      students_transported: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: "Number of students",
      },
      remarks: {
        type: Sequelize.TEXT,
        comment: "Any incidents or notes",
      },
      logged_by: {
        type: Sequelize.UUID,
        references: {
          model: "users",
          key: "id",
        },
        comment: "User who logged (driver or admin)",
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.addIndex("trip_logs", ["trip_date"]);
    await queryInterface.addIndex("trip_logs", ["vehicle_id"]);
    await queryInterface.addIndex("trip_logs", ["route_id"]);
    await queryInterface.addIndex("trip_logs", ["driver_id"]);
    await queryInterface.addIndex("trip_logs", ["trip_type"]);
  },

  down: async (queryInterface, Sequelize) => {
    // Drop tables in reverse order (respecting foreign key constraints)
    await queryInterface.dropTable("trip_logs");
    await queryInterface.dropTable("special_trips");
    await queryInterface.dropTable("student_route_allocations");
    await queryInterface.dropTable("vehicle_route_assignments");
    await queryInterface.dropTable("transport_drivers");
    await queryInterface.dropTable("transport_vehicles");
    await queryInterface.dropTable("transport_stops");
    await queryInterface.dropTable("transport_routes");
  },
};
