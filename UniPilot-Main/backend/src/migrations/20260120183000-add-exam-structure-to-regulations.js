module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("regulations", "exam_structure", {
      type: Sequelize.JSONB,
      defaultValue: {},
      comment:
        "Defines exam types, components, and calculation formulas for this regulation",
    });

    await queryInterface.addColumn("regulations", "grade_scale", {
      type: Sequelize.JSONB,
      defaultValue: [],
      comment: "Array of grade mappings: [{grade, min, max, points}]",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("regulations", "exam_structure");
    await queryInterface.removeColumn("regulations", "grade_scale");
  },
};
