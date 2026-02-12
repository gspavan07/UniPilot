"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const permissions = [
      {
        id: Sequelize.literal("gen_random_uuid()"),
        name: "View Library Catalog",
        slug: "library:books:view",
        module: "Library",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: Sequelize.literal("gen_random_uuid()"),
        name: "Manage Books",
        slug: "library:books:manage",
        module: "Library",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: Sequelize.literal("gen_random_uuid()"),
        name: "Issue/Return Books",
        slug: "library:issue",
        module: "Library",
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
        [Op.in]: [
          "library:books:view",
          "library:books:manage",
          "library:issue",
        ],
      },
    });
  },
};
