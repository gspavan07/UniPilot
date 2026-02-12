"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("admission_configs", "required_documents", {
      type: Sequelize.JSONB,
      allowNull: false,
      defaultValue: [
        "Photo ID",
        "10th Marksheet",
        "12th Marksheet",
        "Entrance Rank Card",
        "Transfer Certificate",
      ],
    });

    await queryInterface.addColumn("admission_configs", "field_config", {
      type: Sequelize.JSONB,
      allowNull: false,
      defaultValue: {
        personal: {
          first_name: { visible: true, required: true },
          last_name: { visible: true, required: true },
          email: { visible: true, required: true },
          phone: { visible: true, required: true },
          date_of_birth: { visible: true, required: true },
          gender: { visible: true, required: true },
        },
        academic: {
          department_id: { visible: true, required: true },
          program_id: { visible: true, required: true },
          batch_year: { visible: true, required: true },
        },
      },
    });

    await queryInterface.addColumn("admission_configs", "seat_matrix", {
      type: Sequelize.JSONB,
      allowNull: false,
      defaultValue: {},
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn(
      "admission_configs",
      "required_documents"
    );
    await queryInterface.removeColumn("admission_configs", "field_config");
    await queryInterface.removeColumn("admission_configs", "seat_matrix");
  },
};
