const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const CourseFaculty = sequelize.define(
    "CourseFaculty",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        course_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "courses",
                key: "id",
            },
        },
        faculty_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "users",
                key: "id",
            },
        },
        batch_year: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "Batch year this assignment applies to (e.g., 2023)",
        },
        semester: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "Semester number (e.g., 5)",
        },
        section: {
            type: DataTypes.STRING(10),
            allowNull: true,
            comment: "Optional: specific section (A, B, etc.)",
        },
        academic_year: {
            type: DataTypes.STRING(20),
            allowNull: false,
            comment: "Academic year string (e.g., '2025-2026')",
        },
        assigned_by: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: "users",
                key: "id",
            },
        }
    },
    {
        tableName: "course_faculties",
        timestamps: true,
        underscored: true,
        indexes: [
            {
                unique: false,
                fields: ["course_id", "faculty_id", "batch_year", "section"],
            },
        ],
    },
);

module.exports = CourseFaculty;
