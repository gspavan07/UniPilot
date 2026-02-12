"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("job_postings", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      company_id: {
        type: Sequelize.UUID,
        references: {
          model: "companies",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      role_title: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      job_description: {
        type: Sequelize.TEXT,
      },
      ctc_lpa: {
        type: Sequelize.DECIMAL(5, 2),
      },
      ctc_breakdown: {
        type: Sequelize.JSONB,
      },
      work_location: {
        type: Sequelize.STRING(255),
      },
      bond_details: {
        type: Sequelize.TEXT,
      },
      number_of_positions: {
        type: Sequelize.INTEGER,
      },
      application_deadline: {
        type: Sequelize.DATE,
      },
      required_skills: {
        type: Sequelize.ARRAY(Sequelize.TEXT),
      },
      preferred_skills: {
        type: Sequelize.ARRAY(Sequelize.TEXT),
      },
      jd_document_url: {
        type: Sequelize.STRING(500),
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

    await queryInterface.createTable("placement_drives", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      job_posting_id: {
        type: Sequelize.UUID,
        references: {
          model: "job_postings",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      drive_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      drive_type: {
        type: Sequelize.ENUM("on_campus", "off_campus", "pool_campus"),
        defaultValue: "on_campus",
      },
      drive_date: {
        type: Sequelize.DATEONLY,
      },
      venue: {
        type: Sequelize.STRING(255),
      },
      mode: {
        type: Sequelize.ENUM("online", "offline", "hybrid"),
        defaultValue: "offline",
      },
      status: {
        type: Sequelize.ENUM("scheduled", "ongoing", "completed", "cancelled"),
        defaultValue: "scheduled",
      },
      coordinator_id: {
        type: Sequelize.UUID,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      registration_start: {
        type: Sequelize.DATE,
      },
      registration_end: {
        type: Sequelize.DATE,
      },
      registration_form_fields: {
        type: Sequelize.JSONB,
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

    await queryInterface.createTable("drive_eligibility", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      drive_id: {
        type: Sequelize.UUID,
        references: {
          model: "placement_drives",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      department_ids: {
        type: Sequelize.ARRAY(Sequelize.UUID),
      },
      regulation_ids: {
        type: Sequelize.ARRAY(Sequelize.UUID),
      },
      min_cgpa: {
        type: Sequelize.DECIMAL(3, 2),
      },
      max_active_backlogs: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      max_total_backlogs: {
        type: Sequelize.INTEGER,
      },
      min_semester: {
        type: Sequelize.INTEGER,
      },
      max_semester: {
        type: Sequelize.INTEGER,
      },
      custom_conditions: {
        type: Sequelize.JSONB,
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

    await queryInterface.createTable("drive_rounds", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      drive_id: {
        type: Sequelize.UUID,
        references: {
          model: "placement_drives",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      round_number: {
        type: Sequelize.INTEGER,
      },
      round_name: {
        type: Sequelize.STRING(100),
      },
      round_type: {
        type: Sequelize.STRING(50),
      },
      round_date: {
        type: Sequelize.DATEONLY,
      },
      round_time: {
        type: Sequelize.TIME,
      },
      venue: {
        type: Sequelize.STRING(255),
      },
      mode: {
        type: Sequelize.ENUM("online", "offline"),
        defaultValue: "offline",
      },
      test_link: {
        type: Sequelize.STRING(500),
      },
      duration_minutes: {
        type: Sequelize.INTEGER,
      },
      is_eliminatory: {
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
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("drive_rounds");
    await queryInterface.dropTable("drive_eligibility");
    await queryInterface.dropTable("placement_drives");
    await queryInterface.dropTable("job_postings");
  },
};
