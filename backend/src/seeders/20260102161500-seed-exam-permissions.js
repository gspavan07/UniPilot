"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const permissions = [
      {
        id: Sequelize.literal("gen_random_uuid()"),
        name: "Manage Examinations",
        slug: "academics:exams:manage",
        module: "Academics",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: Sequelize.literal("gen_random_uuid()"),
        name: "View Exam Results",
        slug: "academics:exams:results:view",
        module: "Academics",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    return queryInterface.bulkInsert("permissions", permissions);
  },

  down: async (queryInterface, Sequelize) => {
    const { Op } = Sequelize;
    return queryInterface.bulkDelete("permissions", {
      slug: {
        [Op.in]: ["academics:exams:manage", "academics:exams:results:view"],
      },
    });
  },
};
