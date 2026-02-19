import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const StudentChargePayment = sequelize.define(
    "StudentChargePayment",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        // Parent Transaction Record
        fee_payment_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: { model: "fee_payments", key: "id" },
            onDelete: "CASCADE",
        },
        student_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: { model: "users", key: "id" },
        },
        student_fee_charge_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: { model: "student_fee_charges", key: "id" },
        },
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            comment: "Amount allocated to this specific charge",
        },
    },
    {
        tableName: "student_charge_payments",
        timestamps: true,
        underscored: true,
        indexes: [
            { fields: ["fee_payment_id"] },
            { fields: ["student_id"] },
            { fields: ["student_fee_charge_id"] },
        ],
    },
);

export default StudentChargePayment;
