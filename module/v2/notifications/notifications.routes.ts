import express from "express";
import { verifyUser } from "../../../middleware/verifyUsers";
import { createNotification, getAllNotificaions, getCountUnreadNotifications, markeAsReadNotifications } from "./notifications.controllers";

const router = express.Router();

router.post("/create", verifyUser("PARTNER", "ADMIN"), createNotification);

router.get("/get-all", verifyUser("PARTNER", "ADMIN"), getAllNotificaions);

router.get("/unread-count", verifyUser("PARTNER", "ADMIN"), getCountUnreadNotifications);
router.patch("/mark-as-read", verifyUser("PARTNER", "ADMIN"), markeAsReadNotifications);

export default router;
