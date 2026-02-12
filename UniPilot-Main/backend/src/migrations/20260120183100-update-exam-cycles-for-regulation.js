module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("exam_cycles", "regulation_id", {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: "regulations",
        key: "id",
      },
      comment: "Links to regulation for exam structure configuration",
    });

    await queryInterface.addColumn("exam_cycles", "cycle_type", {
      type: Sequelize.STRING(50),
      comment:
        "Type from regulation config: mid_term, end_semester, internal_lab, etc.",
    });

    await queryInterface.addColumn("exam_cycles", "instance_number", {
      type: Sequelize.INTEGER,
      defaultValue: 1,
      comment: "1st Mid, 2nd Mid, etc.",
    });

    await queryInterface.addColumn("exam_cycles", "component_breakdown", {
      type: Sequelize.JSONB,
      defaultValue: [],
      comment:
        "Component structure copied from regulation: [{name, max_marks}]",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("exam_cycles", "regulation_id");
    await queryInterface.removeColumn("exam_cycles", "cycle_type");
    await queryInterface.removeColumn("exam_cycles", "instance_number");
    await queryInterface.removeColumn("exam_cycles", "component_breakdown");
  },
};
