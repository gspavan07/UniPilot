'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.removeColumn('exam_marks', 'remarks');
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.addColumn('exam_marks', 'remarks', {
            type: Sequelize.TEXT,
        });
    }
};
