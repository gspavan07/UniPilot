'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // 1. Add paper_format to exam_cycles
        await queryInterface.addColumn('exam_cycles', 'paper_format', {
            type: Sequelize.JSONB,
            defaultValue: {},
            allowNull: false,
            comment: 'Question paper formats per course: { course_id: [questions] }'
        });

        // 2. Drop question_paper_templates table
        // Assuming we don't need to preserve data as per user request (delete it)
        await queryInterface.dropTable('question_paper_templates');
    },

    async down(queryInterface, Sequelize) {
        // 1. Recreate question_paper_templates
        await queryInterface.createTable('question_paper_templates', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
            },
            course_id: {
                type: Sequelize.UUID,
                allowNull: false,
            },
            program_id: {
                type: Sequelize.UUID,
                allowNull: true,
            },
            questions: {
                type: Sequelize.JSONB,
                defaultValue: [],
            },
            total_marks: {
                type: Sequelize.INTEGER,
            },
            created_by: {
                type: Sequelize.UUID,
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

        // 2. Remove paper_format from exam_cycles
        await queryInterface.removeColumn('exam_cycles', 'paper_format');
    }
};
