const { DataTypes } = require("sequelize");
const sequelize = require("../config/db_connection");

const Role = sequelize.define(
  "Role",
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
    is_system: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "roles",
    timestamps: true,
    underscored: true,
  },
);

Role.associate = (models) => {
  if (models.Permission) {
    Role.belongsToMany(models.Permission, {
      through: "role_permissions",
      as: "permissions",
      foreignKey: "role_id",
    });
  }
};

module.exports = Role;
