const { Notification } = require("../models");
const logger = require("../utils/logger");

// @desc    Get my notifications
// @route   GET /api/notifications
// @access  Private
exports.getMyNotifications = async (req, res) => {
    try {
        const notifications = await Notification.findAll({
            where: { user_id: req.user.userId },
            order: [["created_at", "DESC"]],
            limit: 50, // Pagination can be added later
        });

        res.status(200).json({
            success: true,
            data: notifications,
        });
    } catch (error) {
        logger.error("Error in getMyNotifications:", error);
        res.status(500).json({
            success: false,
            error: "Server Error",
        });
    }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await Notification.findOne({
            where: { id, user_id: req.user.userId },
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                error: "Notification not found",
            });
        }

        notification.is_read = true;
        await notification.save();

        res.status(200).json({
            success: true,
            data: notification,
        });
    } catch (error) {
        logger.error("Error in markAsRead:", error);
        res.status(500).json({
            success: false,
            error: "Server Error",
        });
    }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res) => {
    try {
        await Notification.update(
            { is_read: true },
            { where: { user_id: req.user.userId, is_read: false } }
        );

        res.status(200).json({
            success: true,
            message: "All notifications marked as read"
        });
    } catch (error) {
        logger.error("Error in markAllAsRead:", error);
        res.status(500).json({
            success: false,
            error: "Server Error"
        });
    }
};
// @desc    Delete all notifications
// @route   DELETE /api/notifications/delete-all
// @access  Private
exports.deleteAllNotifications = async (req, res) => {
    try {
        await Notification.destroy({
            where: { user_id: req.user.userId }
        });

        res.status(200).json({
            success: true,
            message: "All notifications deleted"
        });
    } catch (error) {
        logger.error("Error in deleteAllNotifications:", error);
        res.status(500).json({
            success: false,
            error: "Server Error"
        });
    }
};
// @desc    Create a new notification (For internal or faculty use)
// @route   POST /api/notifications
// @access  Private
exports.createNotification = async (req, res) => {
    try {
        const { user_id, title, message, type, metadata } = req.body;

        if (!user_id || !title || !message) {
            return res.status(400).json({
                success: false,
                error: "Please provide user_id, title, and message"
            });
        }

        const notification = await Notification.create({
            user_id,
            title,
            message,
            type: type || "INFO",
            metadata: metadata || null,
        });

        res.status(201).json({
            success: true,
            data: notification
        });
    } catch (error) {
        logger.error("Error in createNotification:", error);
        res.status(500).json({
            success: false,
            error: "Server Error"
        });
    }
};
