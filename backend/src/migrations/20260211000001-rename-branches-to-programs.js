"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.renameColumn("exam_schedules", "branches", "programs");
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.renameColumn("exam_schedules", "programs", "branches");
    },
};
