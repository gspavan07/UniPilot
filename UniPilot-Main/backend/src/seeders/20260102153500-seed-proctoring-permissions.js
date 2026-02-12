"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const permissions = [
      {
        id: Sequelize.literal("gen_random_uuid()"),
        name: "View Proctoring Info",
        slug: "proctoring:view",
        module: "Proctoring",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: Sequelize.literal("gen_random_uuid()"),
        name: "Manage Assignments",
        slug: "proctoring:manage",
        module: "Proctoring",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: Sequelize.literal("gen_random_uuid()"),
        name: "Mentoring Tasks",
        slug: "proctoring:mentor",
        module: "Proctoring",
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
        [Op.in]: ["proctoring:view", "proctoring:manage", "proctoring:mentor"],
      },
    });
  },
};
