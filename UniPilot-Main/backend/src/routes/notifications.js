const express = require("express");
const {
    getMyNotifications,
    markAsRead,
    markAllAsRead,
    deleteAllNotifications,
    createNotification,
} = require("../controllers/notificationController");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

router.use(authenticate);


router.post("/", createNotification);
router.get("/", getMyNotifications);
router.put("/read-all", markAllAsRead);
router.put("/:id/read", markAsRead);
router.delete("/delete-all", deleteAllNotifications);

module.exports = router;
