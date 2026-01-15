const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const LeaveBalance = sequelize.define(
  "LeaveBalance",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "users", key: "id" },
    },
    leave_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    total_credits: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    used: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    balance: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
  },
  {
    tableName: "leave_balances",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ["user_id", "leave_type", "year"],
      },
    ],
  }
);

LeaveBalance.associate = (models) => {
  LeaveBalance.belongsTo(models.User, {
    foreignKey: "user_id",
    as: "user",
  });
};

module.exports = LeaveBalance;
