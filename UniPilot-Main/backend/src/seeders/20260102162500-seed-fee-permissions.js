"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const permissions = [
      {
        id: Sequelize.literal("gen_random_uuid()"),
        name: "Administer Fee Structures",
        slug: "finance:fees:admin",
        module: "Finance",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: Sequelize.literal("gen_random_uuid()"),
        name: "Finance Oversight",
        slug: "finance:fees:oversight",
        module: "Finance",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: Sequelize.literal("gen_random_uuid()"),
        name: "Manage Fees",
        slug: "finance:fees:manage",
        module: "Finance",
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
          "finance:fees:admin",
          "finance:fees:oversight",
          "finance:fees:manage",
        ],
      },
    });
  },
};
