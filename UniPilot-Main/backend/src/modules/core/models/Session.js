import { DataTypes } from "sequelize";
import { sequelize } from "../../../config/database.js";

/**
 * Session Model
 * Represents user sessions and stores hashed refresh tokens
 */
const Session = sequelize.define(
    "Session",
    {
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
    },
    {
        tableName: "sessions",
        schema: 'core',
        timestamps: true,
        underscored: true,
        indexes: [
            { fields: ["user_id"] },
            { fields: ["refresh_token_hash"] },
        ],
    }
);

Session.associate = (models) => {
    Session.belongsTo(models.User, { foreignKey: "user_id", as: "user" });
};

export default Session;
