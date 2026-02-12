const { v4: uuidv4 } = require("uuid");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const adminDepts = [
      {
        id: uuidv4(),
        name: "Human Resources",
        code: "HR",
        description: "Administrative team for staff management and payroll.",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: "Finance & Accounts",
        code: "FIN",
        description:
          "Administrative team for financial management and reporting.",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: "Admissions Office",
        code: "ADM",
        description:
          "Administrative team for student enrollment and inquiries.",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: "Examinations Branch",
        code: "EXM",
        description:
          "Administrative team for exam scheduling and result management.",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: "Transport Department",
        code: "TRN",
        description:
          "Administrative team for university logistics and fleet management.",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: "Hostel Administration",
        code: "HST",
        description:
          "Administrative team for student accommodation and facilities.",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: "IT & ID Card Services",
        code: "ITS",
        description:
          "Administrative team for technical support and identity management.",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: "General Administration",
        code: "GEN",
        description:
          "Central administrative team for overall university operations.",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    // Check for existing departments before inserting
    for (const dept of adminDepts) {
      const [existing] = await queryInterface.sequelize.query(
        `SELECT id FROM departments WHERE code = '${dept.code}' LIMIT 1;`
      );
      if (existing.length === 0) {
        await queryInterface.bulkInsert("departments", [dept]);
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    const codes = ["HR", "FIN", "ADM", "EXM", "TRN", "HST", "ITS", "GEN"];
    return queryInterface.bulkDelete("departments", {
      code: { [Sequelize.Op.in]: codes },
    });
  },
};
