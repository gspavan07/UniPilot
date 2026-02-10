"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Add courses_list to Regulations
        await queryInterface.addColumn("regulations", "courses_list", {
            type: Sequelize.JSONB,
            defaultValue: {},
            comment: "Mapping of courses to programs and semesters: { 'Program Name': { 'Semester Number': [Course IDs] } }",
        });

        // Remove semester from Courses
        await queryInterface.removeColumn("courses", "semester");

        // Remove program_id from Courses
        await queryInterface.removeColumn("courses", "program_id");
    },

    async down(queryInterface, Sequelize) {
        // Add program_id back to Courses
        await queryInterface.addColumn("courses", "program_id", {
            type: Sequelize.UUID,
            references: {
                model: "programs",
                key: "id",
            },
            comment: "If null, course is common across programs",
        });

        // Add semester back to Courses
        await queryInterface.addColumn("courses", "semester", {
            type: Sequelize.INTEGER,
            comment: "Which semester this course is offered in",
        });

        // Remove courses_list from Regulations
        await queryInterface.removeColumn("regulations", "courses_list");
    },
};
