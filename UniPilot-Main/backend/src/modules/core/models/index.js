import User from "./User.js";
import Session from "./Session.js";
import Role from "./Role.js";
import Permission from "./Permission.js";

export { User, Session, Role, Permission };

// -----------------------------------------------------------------------------
// Core Module Internal Associations
// -----------------------------------------------------------------------------

// User <-> Session
Session.belongsTo(User, { as: "user", foreignKey: "user_id" });
User.hasMany(Session, { as: "sessions", foreignKey: "user_id" });

// Role <-> User
User.belongsTo(Role, { as: "role_data", foreignKey: "role_id" });
Role.hasMany(User, { as: "users", foreignKey: "role_id" });

// Role <-> Permission
Role.belongsToMany(Permission, {
  through: "role_permissions",
  as: "permissions",
  foreignKey: "role_id",
  otherKey: "permission_id",
});
Permission.belongsToMany(Role, {
  through: "role_permissions",
  as: "roles",
  foreignKey: "permission_id",
  otherKey: "role_id",
});

export default {
  User,
  Session,
  Role,
  Permission,
};
