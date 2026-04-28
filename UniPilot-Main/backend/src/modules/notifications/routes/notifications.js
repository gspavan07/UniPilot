import express from "express";
import {
    getMyNotifications,
    markAsRead,
    markAllAsRead,
    deleteAllNotifications,
    createNotification,
} from "../controllers/notificationController.js";
import { authenticate } from "../../../middleware/auth.js";

const router = express.Router();

router.use(authenticate);


router.post("/", createNotification);
router.get("/", getMyNotifications);
router.put("/read-all", markAllAsRead);
router.put("/:id/read", markAsRead);
router.delete("/delete-all", deleteAllNotifications);

export default router;
