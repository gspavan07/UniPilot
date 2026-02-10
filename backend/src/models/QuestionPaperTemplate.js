const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

/**
 * QuestionPaperTemplate Model
 * Stores the structure/format of a question paper for a specific course.
 * Defines question numbers, marks, and mapped COs without actual question content.
 */
const QuestionPaperTemplate = sequelize.define(
    "QuestionPaperTemplate",
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
        program_id: {
            type: DataTypes.UUID,
            allowNull: true, // Optional if template is generic for course
            references: {
                model: "programs",
                key: "id",
            },
        },
        questions: {
            type: DataTypes.JSONB,
            defaultValue: [],
            // Structure: [{ q_no: "Q1", marks: 5, co_id: "uuid" }]
            allowNull: false,
        },
        total_marks: {
            type: DataTypes.FLOAT,
            defaultValue: 0,
        },
        status: {
            type: DataTypes.ENUM("draft", "active", "archived"),
            defaultValue: "active",
        },
        created_by: {
            type: DataTypes.UUID,
            allowNull: true,
        },
    },
    {
        tableName: "question_paper_templates",
        timestamps: true,
        underscored: true,
    }
);

module.exports = QuestionPaperTemplate;
