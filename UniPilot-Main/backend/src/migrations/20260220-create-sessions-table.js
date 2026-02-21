import { DataTypes } from "sequelize";

export default {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable("sessions", {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            user_id: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: "users",
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

        await queryInterface.addIndex("sessions", ["user_id"]);
        await queryInterface.addIndex("sessions", ["refresh_token_hash"]);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable("sessions");
    },
};
