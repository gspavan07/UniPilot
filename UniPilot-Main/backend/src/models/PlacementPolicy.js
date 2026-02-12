const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const PlacementPolicy = sequelize.define(
  "PlacementPolicy",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    policy_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    policy_type: {
      type: DataTypes.STRING(50),
    },
    policy_rules: {
      type: DataTypes.JSONB,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    academic_year: {
      type: DataTypes.STRING(10),
    },
  },
  {
    tableName: "placement_policies",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

module.exports = PlacementPolicy;
