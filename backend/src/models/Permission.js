const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Permission = sequelize.define(
  "Permission",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    module: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
  },
  {
    tableName: "permissions",
    timestamps: true,
    underscored: true,
  }
);

Permission.associate = (models) => {
  Permission.belongsToMany(models.Role, {
    through: "role_permissions",
    foreignKey: "permission_id",
    otherKey: "role_id",
    as: "roles",
  });
};

module.exports = Permission;
