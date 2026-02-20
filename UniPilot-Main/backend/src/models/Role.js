import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const Role = sequelize.define(
  "Role",
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
    description: {
      type: DataTypes.TEXT,
    },
    field_config: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    is_system: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "roles",
    timestamps: true,
    underscored: true,
  }
);

Role.associate = (models) => {
  Role.hasMany(models.User, {
    foreignKey: "role_id",
    as: "users",
  });
  Role.belongsToMany(models.Permission, {
    through: "role_permissions",
    foreignKey: "role_id",
    otherKey: "permission_id",
    as: "permissions",
  });
};

export default Role;
