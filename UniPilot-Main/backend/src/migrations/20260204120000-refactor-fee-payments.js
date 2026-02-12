"use strict";
const { v4: uuidv4 } = require("uuid");

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // 1. Create AcademicFeePayments Table
        await queryInterface.createTable("academic_fee_payments", {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
            },
            fee_payment_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: { model: "fee_payments", key: "id" },
                onDelete: "CASCADE",
            },
            student_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: { model: "users", key: "id" },
            },
            fee_structure_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: { model: "fee_structures", key: "id" },
            },
            amount: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.fn("NOW"),
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.fn("NOW"),
            },
        });

        // 2. Create StudentChargePayments Table
        await queryInterface.createTable("student_charge_payments", {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
            },
            fee_payment_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: { model: "fee_payments", key: "id" },
                onDelete: "CASCADE",
            },
            student_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: { model: "users", key: "id" },
            },
            student_fee_charge_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: { model: "student_fee_charges", key: "id" },
            },
            amount: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.fn("NOW"),
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.fn("NOW"),
            },
        });

        // 3. Update ExamFeePayments Table
        const tableInfo = await queryInterface.describeTable("exam_fee_payments");
        if (!tableInfo.fee_payment_id) {
            await queryInterface.addColumn("exam_fee_payments", "fee_payment_id", {
                type: Sequelize.UUID,
                allowNull: true,
                references: { model: "fee_payments", key: "id" },
                onDelete: "CASCADE",
            });
        }

        // 4. Data Migration: Create Payment Records & Links

        // A. Migrate Academic Fees (FeePayment -> AcademicFeePayment)
        // Fetch all FeePayments that have a fee_structure_id
        const academicPayments = await queryInterface.sequelize.query(
            `SELECT * FROM fee_payments WHERE fee_structure_id IS NOT NULL`,
            { type: Sequelize.QueryTypes.SELECT }
        );

        for (const payment of academicPayments) {
            // FeePayment is already the Master Record. We just need to create the CHILD.
            await queryInterface.bulkInsert("academic_fee_payments", [
                {
                    id: uuidv4(),
                    fee_payment_id: payment.id,
                    student_id: payment.student_id,
                    fee_structure_id: payment.fee_structure_id,
                    amount: payment.amount_paid || 0,
                    created_at: payment.created_at,
                    updated_at: payment.updated_at,
                },
            ]);
        }

        // B. Migrate Charges (FeePayment -> StudentChargePayment)
        const chargePayments = await queryInterface.sequelize.query(
            `SELECT * FROM fee_payments WHERE fee_charge_id IS NOT NULL`,
            { type: Sequelize.QueryTypes.SELECT }
        );

        for (const payment of chargePayments) {
            await queryInterface.bulkInsert("student_charge_payments", [
                {
                    id: uuidv4(),
                    fee_payment_id: payment.id,
                    student_id: payment.student_id,
                    student_fee_charge_id: payment.fee_charge_id,
                    amount: payment.amount_paid || 0,
                    created_at: payment.created_at,
                    updated_at: payment.updated_at,
                },
            ]);
        }

        // C. Migrate Exam Fees (ExamFeePayment -> Global FeePayment + Link)
        const examPayments = await queryInterface.sequelize.query(
            `SELECT * FROM exam_fee_payments WHERE fee_payment_id IS NULL`,
            { type: Sequelize.QueryTypes.SELECT }
        );

        for (const payment of examPayments) {
            const newGlobalId = uuidv4();

            // Create Parent Global Record
            await queryInterface.bulkInsert("fee_payments", [
                {
                    id: newGlobalId,
                    student_id: payment.student_id,
                    // New FeePayment structure should probably use amount_paid to stay consistent with existing data?
                    // Previous definition of FeePayment had amount_paid.
                    amount_paid: payment.amount,
                    payment_date: payment.payment_date || new Date(),
                    transaction_id: payment.transaction_id || `MIG-${Date.now()}`,
                    payment_method: payment.payment_method || 'unknown',
                    status: payment.status || 'completed',
                    remarks: payment.remarks,
                    created_at: payment.created_at,
                    updated_at: payment.updated_at,
                    // fee_structure_id & fee_charge_id are NULL
                }
            ]);

            // Link Child to Parent
            await queryInterface.bulkUpdate(
                "exam_fee_payments",
                { fee_payment_id: newGlobalId },
                { id: payment.id }
            );
        }

        // 5. Cleanup: Make old columns nullable (Safe approach vs dropping)
        await queryInterface.changeColumn("fee_payments", "fee_structure_id", {
            type: Sequelize.UUID,
            allowNull: true,
        });
        await queryInterface.changeColumn("fee_payments", "fee_charge_id", {
            type: Sequelize.UUID,
            allowNull: true,
        });
    },

    down: async (queryInterface, Sequelize) => {
        // Revert is complex due to data loss risks, so we just remove tables/columns
        await queryInterface.removeColumn("exam_fee_payments", "fee_payment_id");
        await queryInterface.dropTable("student_charge_payments");
        await queryInterface.dropTable("academic_fee_payments");
    },
};
