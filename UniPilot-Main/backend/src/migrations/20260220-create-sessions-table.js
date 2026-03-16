import { DataTypes } from "sequelize";

export default {
    up: async (queryInterface, Sequelize) => {
        const table = { schema: "core", tableName: "sessions" };

        // Ensure core schema exists
        await queryInterface.sequelize.query(
            'CREATE SCHEMA IF NOT EXISTS "core";'
        );

        // If sessions already exists in core, skip creation
        const [coreCheck] = await queryInterface.sequelize.query(
            `SELECT to_regclass('core."sessions"') AS tbl;`
        );
        if (coreCheck?.[0]?.tbl) {
            return;
        }

        // If sessions exists in public, move it into core
        const [publicCheck] = await queryInterface.sequelize.query(
            `SELECT to_regclass('public."sessions"') AS tbl;`
        );
        if (publicCheck?.[0]?.tbl) {
            await queryInterface.sequelize.query(
                `ALTER TABLE public."sessions" SET SCHEMA "core";`
            );
            return;
        }

        await queryInterface.createTable(table, {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            user_id: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: { schema: "core", tableName: "users" },
                    key: "id",
                },
                onDelete: "CASCADE",
            },
            refresh_token_hash: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            ip_address: {
                type: DataTypes.STRING(45),
            },
            user_agent: {
                type: DataTypes.TEXT,
            },
            expires_at: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            last_used_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
            revoked: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            created_at: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            updated_at: {
                type: DataTypes.DATE,
                allowNull: false,
            },
        });

        await queryInterface.addIndex(table, ["user_id"]);
        await queryInterface.addIndex(table, ["refresh_token_hash"]);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable({ schema: "core", tableName: "sessions" });
    },
};
