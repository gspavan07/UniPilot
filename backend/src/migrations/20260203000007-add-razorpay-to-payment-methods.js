"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        return queryInterface.sequelize.query(
            "ALTER TYPE \"enum_fee_payments_payment_method\" ADD VALUE 'razorpay';"
        );
    },

    down: async (queryInterface, Sequelize) => {
        // ENUM values cannot be removed in Postgres easily
        // We would have to recreate the type, which is complex and usually not needed for a revert of adding a value
        return Promise.resolve();
    },
};
