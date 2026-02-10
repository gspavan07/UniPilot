"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable("question_paper_templates", {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
            },
            course_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: "courses",
                    key: "id",
                },
                onDelete: "CASCADE",
            },
            program_id: {
                type: Sequelize.UUID,
                allowNull: true,
                references: {
                    model: "programs",
                    key: "id",
                },
                onDelete: "SET NULL",
            },
            questions: {
                type: Sequelize.JSONB,
                defaultValue: [],
                allowNull: false,
            },
            total_marks: {
                type: Sequelize.FLOAT,
                defaultValue: 0,
            },
            status: {
                type: Sequelize.ENUM("draft", "active", "archived"),
                defaultValue: "active",
            },
            created_by: {
                type: Sequelize.UUID,
                allowNull: true,
                references: {
                    model: "users",
                    key: "id",
                },
                onDelete: "SET NULL",
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

        // Add indexes
        await queryInterface.addIndex("question_paper_templates", ["course_id"]);
        await queryInterface.addIndex("question_paper_templates", ["program_id"]);
        await queryInterface.addIndex("question_paper_templates", ["status"]);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable("question_paper_templates");
    },
};
