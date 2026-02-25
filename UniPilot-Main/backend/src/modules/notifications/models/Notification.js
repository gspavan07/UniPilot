import { DataTypes } from "sequelize";
import { sequelize } from "../../../config/database.js";

const Notification = sequelize.define(
    "Notification",
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
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        type: {
            type: DataTypes.STRING(50),
            defaultValue: "INFO", // INFO, WARNING, SUCCESS, ERROR, ASSIGNMENT
        },
        is_read: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        metadata: {
            type: DataTypes.JSONB,
            allowNull: true,
            comment: "Additional data like link, entity_id, etc.",
        },
    },
    {
        tableName: "notifications",
        timestamps: true,
        underscored: true,
    },
);

export default Notification;
