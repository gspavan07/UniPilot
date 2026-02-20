import { DataTypes } from "sequelize";

export default {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      "exam_student_eligibilities",
      "condonation_fee_amount",
      {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.0,
        allowNull: false,
      },
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn(
      "exam_student_eligibilities",
      "condonation_fee_amount",
    );
  },
};
