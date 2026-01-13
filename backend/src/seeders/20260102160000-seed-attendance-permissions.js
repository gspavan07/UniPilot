"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const permissions = [
      {
        id: Sequelize.literal("gen_random_uuid()"),
        name: "Manage Attendance",
        slug: "academics:attendance:manage",
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
        [Op.in]: ["academics:attendance:manage", "academics:attendance:view"],
      },
    });
  },
};
