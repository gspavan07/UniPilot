"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const permissions = [
      {
        id: require("crypto").randomUUID(),
        slug: "exams:reverification:view",
        name: "View Reverification Requests",
        description: "View exam reverification requests",
        module: "exams",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: require("crypto").randomUUID(),
        slug: "exams:reverification:manage",
        name: "Manage Reverification",
        description:
          "Configure reverification windows, review requests, and update marks after reverification",
        module: "exams",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: require("crypto").randomUUID(),
        slug: "exams:scripts:view",
        name: "View Exam Scripts",
        description: "View uploaded exam answer scripts",
        module: "exams",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: require("crypto").randomUUID(),
        slug: "exams:scripts:manage",
        name: "Manage Exam Scripts",
        description:
          "Upload, manage, and control visibility of exam answer scripts",
        module: "exams",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    await queryInterface.bulkInsert("permissions", permissions, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("permissions", {
      slug: [
        "exams:reverification:view",
        "exams:reverification:manage",
        "exams:scripts:view",
        "exams:scripts:manage",
      ],
    });
  },
};
