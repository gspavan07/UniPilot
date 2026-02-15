const { DataTypes } = require("sequelize");
const sequelize = require("../config/db_connection");

const Permission = sequelize.define(
  "Permission",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: DataTypes.TEXT,
    module: DataTypes.STRING,
  },
  {
    tableName: "permissions",
    timestamps: true,
    underscored: true,
  },
);

Permission.associate = (models) => {
  if (models.Role) {
    Permission.belongsToMany(models.Role, {
      through: "role_permissions",
      as: "roles",
      foreignKey: "permission_id",
    });
  }
};

module.exports = Permission;
