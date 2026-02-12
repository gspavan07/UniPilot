module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("exam_marks", "component_scores", {
      type: Sequelize.JSONB,
      defaultValue: null,
      comment:
        "Component-wise scores: {assignment: 4, objective: 9, descriptive: 13}",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("exam_marks", "component_scores");
  },
};
