import { DataTypes } from "sequelize";
import { sequelize } from "../../../config/database.js";

const AcademicFeePayment = sequelize.define(
    "AcademicFeePayment",
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
        fee_structure_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: { model: "fee_structures", key: "id" },
        },
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            comment: "Amount allocated to this specific academic fee structure",
        },
    },
    {
        tableName: "academic_fee_payments",
        timestamps: true,
        underscored: true,
        indexes: [
            { fields: ["fee_payment_id"] },
            { fields: ["student_id"] },
            { fields: ["fee_structure_id"] },
        ],
    },
);

export default AcademicFeePayment;
