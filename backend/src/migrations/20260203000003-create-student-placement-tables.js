"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("student_placement_profiles", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      student_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      technical_skills: {
        type: Sequelize.ARRAY(Sequelize.TEXT),
      },
      soft_skills: {
        type: Sequelize.ARRAY(Sequelize.TEXT),
      },
      programming_languages: {
        type: Sequelize.ARRAY(Sequelize.TEXT),
      },
      certifications: {
        type: Sequelize.JSONB,
      },
      projects: {
        type: Sequelize.JSONB,
      },
      internships: {
        type: Sequelize.JSONB,
      },
      achievements: {
        type: Sequelize.ARRAY(Sequelize.TEXT),
      },
      linkedin_url: {
        type: Sequelize.STRING(255),
      },
      github_url: {
        type: Sequelize.STRING(255),
      },
      portfolio_url: {
        type: Sequelize.STRING(255),
      },
      resume_versions: {
        type: Sequelize.JSONB,
      },
      profile_completion_percentage: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
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

    await queryInterface.createTable("student_applications", {
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
      student_id: {
        type: Sequelize.UUID,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      registration_form_data: {
        type: Sequelize.JSONB,
      },
      applied_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      is_eligible: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      eligibility_check_data: {
        type: Sequelize.JSONB,
      },
      status: {
        type: Sequelize.ENUM(
          "applied",
          "withdrawn",
          "shortlisted",
          "rejected",
          "placed",
        ),
        defaultValue: "applied",
      },
      current_round_id: {
        type: Sequelize.UUID,
        references: {
          model: "drive_rounds",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      withdrawal_reason: {
        type: Sequelize.TEXT,
      },
      withdrawn_at: {
        type: Sequelize.DATE,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      // UNIQUE(drive_id, student_id)
    });

    await queryInterface.addConstraint("student_applications", {
      fields: ["drive_id", "student_id"],
      type: "unique",
      name: "unique_student_drive_application",
    });

    await queryInterface.createTable("round_results", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      round_id: {
        type: Sequelize.UUID,
        references: {
          model: "drive_rounds",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      student_id: {
        type: Sequelize.UUID,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      result: {
        type: Sequelize.ENUM("selected", "rejected", "on_hold", "absent"),
        defaultValue: "on_hold",
      },
      score: {
        type: Sequelize.DECIMAL(5, 2),
      },
      remarks: {
        type: Sequelize.TEXT,
      },
      uploaded_via: {
        type: Sequelize.STRING(20),
        defaultValue: "manual",
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

    await queryInterface.addConstraint("round_results", {
      fields: ["round_id", "student_id"],
      type: "unique",
      name: "unique_student_round_result",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("round_results");
    await queryInterface.dropTable("student_applications");
    await queryInterface.dropTable("student_placement_profiles");
  },
};
