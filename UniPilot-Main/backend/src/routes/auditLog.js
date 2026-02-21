import express from "express";
import { authenticate, checkPermission } from "../middleware/auth.js";
import AuditLog from "../models/AuditLog.js";
import { User } from "../models/index.js";
import { Op } from "sequelize";

const router = express.Router();

/**
 * GET /api/audit-logs
 * Paginated, filterable audit log viewer (super_admin only)
 */
router.get(
    "/",
    authenticate,
    checkPermission("system.audit_log.view"),
    async (req, res) => {
        try {
            const {
                page = 1,
                limit = 25,
                action,
                user_id,
                search,
                startDate,
                endDate,
            } = req.query;

            const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
            const where = {};

            if (action && action !== "all") {
                where.action = action;
            }

            if (user_id) {
                where.user_id = user_id;
            }

            if (search) {
                where[Op.or] = [
                    { action: { [Op.iLike]: `%${search}%` } },
                    { ip_address: { [Op.iLike]: `%${search}%` } },
                    { "$actor.email$": { [Op.iLike]: `%${search}%` } },
                ];
            }

            if (startDate || endDate) {
                where.created_at = {};
                if (startDate) where.created_at[Op.gte] = new Date(startDate);
                if (endDate)
                    where.created_at[Op.lte] = new Date(
                        new Date(endDate).setHours(23, 59, 59, 999),
                    );
            }

            const { rows: logs, count: total } = await AuditLog.findAndCountAll({
                where,
                include: [
                    {
                        model: User,
                        as: "actor",
                        attributes: ["id", "first_name", "last_name", "email", "role"],
                    },
                ],
                order: [["created_at", "DESC"]],
                limit: parseInt(limit, 10),
                offset,
                subQuery: false,
            });

            res.json({
                success: true,
                data: {
                    logs,
                    pagination: {
                        total,
                        page: parseInt(page, 10),
                        limit: parseInt(limit, 10),
                        totalPages: Math.ceil(total / parseInt(limit, 10)),
                    },
                },
            });
        } catch (error) {
            console.error("Error fetching audit logs:", error);
            res.status(500).json({ success: false, error: "Internal Server Error" });
        }
    },
);

/**
 * GET /api/audit-logs/actions
 * Get distinct action types for filter dropdown
 */
router.get(
    "/actions",
    authenticate,
    checkPermission("system.audit_log.view"),
    async (req, res) => {
        try {
            const actions = await AuditLog.findAll({
                attributes: [
                    [
                        AuditLog.sequelize.fn(
                            "DISTINCT",
                            AuditLog.sequelize.col("action"),
                        ),
                        "action",
                    ],
                ],
                order: [["action", "ASC"]],
                raw: true,
            });
            res.json({
                success: true,
                data: actions.map((a) => a.action),
            });
        } catch (error) {
            res.status(500).json({ success: false, error: "Internal Server Error" });
        }
    },
);

export default router;
