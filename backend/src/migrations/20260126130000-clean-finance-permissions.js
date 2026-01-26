"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      // 1. Get IDs of permissions to keep and permissions to remove
      const [permissions] = await queryInterface.sequelize.query(
        "SELECT id, slug FROM permissions WHERE slug LIKE 'finance:%';",
        { transaction: t },
      );

      const permMap = permissions.reduce((acc, p) => {
        acc[p.slug] = p.id;
        return acc;
      }, {});

      const toKeep = {
        manage: permMap["finance:fees:manage"],
        oversight: permMap["finance:fees:oversight"],
        admin: permMap["finance:fees:admin"],
      };

      const toRemoveSlugs = [
        "finance:fees:view",
        "finance:fees:collect",
        "finance:reports:view",
      ];
      const toRemoveIds = toRemoveSlugs
        .map((slug) => permMap[slug])
        .filter(Boolean);

      if (toRemoveIds.length === 0) return;

      // 2. Re-assign role_permissions before deleting
      // Anyone with 'view' or 'collect' gets 'manage'
      const viewId = permMap["finance:fees:view"];
      const collectId = permMap["finance:fees:collect"];
      const manageId = toKeep.manage;

      if (manageId && (viewId || collectId)) {
        const idsToMapToManage = [viewId, collectId].filter(Boolean);
        await queryInterface.sequelize.query(
          `INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
           SELECT DISTINCT role_id, :manageId::uuid, NOW(), NOW()
           FROM role_permissions
           WHERE permission_id IN (:idsToMapToManage)
           AND NOT EXISTS (
             SELECT 1 FROM role_permissions rp2 
             WHERE rp2.role_id = role_permissions.role_id 
             AND rp2.permission_id = :manageId::uuid
           );`,
          {
            replacements: { manageId, idsToMapToManage },
            transaction: t,
          },
        );
      }

      // Anyone with 'reports:view' gets 'oversight'
      const reportsViewId = permMap["finance:reports:view"];
      const oversightId = toKeep.oversight;

      if (oversightId && reportsViewId) {
        await queryInterface.sequelize.query(
          `INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
           SELECT DISTINCT role_id, :oversightId::uuid, NOW(), NOW()
           FROM role_permissions
           WHERE permission_id = :reportsViewId
           AND NOT EXISTS (
             SELECT 1 FROM role_permissions rp2 
             WHERE rp2.role_id = role_permissions.role_id 
             AND rp2.permission_id = :oversightId::uuid
           );`,
          {
            replacements: { oversightId, reportsViewId },
            transaction: t,
          },
        );
      }

      // 3. Delete redundant mappings
      await queryInterface.sequelize.query(
        "DELETE FROM role_permissions WHERE permission_id IN (:toRemoveIds);",
        { replacements: { toRemoveIds }, transaction: t },
      );

      // 4. Delete the permissions themselves
      await queryInterface.sequelize.query(
        "DELETE FROM permissions WHERE id IN (:toRemoveIds);",
        { replacements: { toRemoveIds }, transaction: t },
      );

      console.log("Finance permissions consolidated successfully.");
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Down migration is complex for data consolidation, typically not implemented for cleanup tasks
    // unless necessary for rollback.
  },
};
