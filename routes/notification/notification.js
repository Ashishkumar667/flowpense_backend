import express from "express";
import { protectedRoutes } from "../../middleware/authMiddleware.js";
import { getNotification } from "../../controllers/Notification/notification.js";
import {
    getNotification,
    markedNotification
} from '../../controllers/Notification/notification.js';

const router = express.Router();

router.get("/get-notification", protectedRoutes, getNotification);

router.put("/update/notification", markedNotification);

export default router;