import { PrismaClient } from "@prisma/client";
import { notificationSend } from "../../../utils/notification.utils";

const prisma = new PrismaClient();

export const createNotification = async (req, res) => {
  try {
    const partnerId = req.user.id;
    const { type, message, eventId, route } = req.body;

    notificationSend(partnerId, type, message, eventId, false, route);

    res.status(201).json({
      success: true,
      message: "Notification created successfully",
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Failed to create notification",
    });
  }
};
export const getAllNotificaions = async (req, res) => {
  try {
    const partnerId = req.user.id;

    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    const notifications = await prisma.notification.findMany({
      where: { partnerId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    res.status(200).json({
      success: true,
      data: notifications,
      pagination: {
        page,
        limit,
        hasNextPage: notifications.length === limit,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
      error: error.message,
    });
  }
};

export const getCountUnreadNotifications = async (req, res) => {
  try {
    const partnerId = req.user.id;

    const unreadCount = await prisma.notification.count({
      where: { partnerId, isRead: false },
    });

    res.status(200).json({
      success: true,
      data: unreadCount,
    });
  } catch (error) {
    console.error("Error fetching unread notifications count:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch unread notifications count",
      error: error.message,
    });
  }
};

export const markeAsReadNotifications = async (req, res) => {
  try {
    const partnerId = req.user.id;
    await prisma.notification.updateMany({
      where: { partnerId, isRead: false },
      data: { isRead: true },
    });
    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark notifications as read",
      error: error.message,
    });
  }
};
