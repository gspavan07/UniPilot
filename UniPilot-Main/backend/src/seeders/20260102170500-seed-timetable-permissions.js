"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const permissions = [
      {
        id: Sequelize.literal("gen_random_uuid()"),
        name: "Manage Timetables",
        slug: "academics:timetable:manage",
        module: "Academic",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: Sequelize.literal("gen_random_uuid()"),
        name: "View Timetables",
        slug: "academics:timetable:view",
        module: "Academic",
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
        [Op.in]: ["academics:timetable:manage", "academics:timetable:view"],
      },
    });
  },
};
