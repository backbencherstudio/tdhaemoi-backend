import { PrismaClient } from "@prisma/client";
import { io } from "../app";

const prisma = new PrismaClient();

export const notificationSend = async (
  partnerId: string,
  type: any,
  message: string,
  eventId: string,
  isRead: boolean,
  route: string
) => {
  try {
    const notification = await prisma.notification.create({
      data: {
        partnerId,
        type,
        message,
        eventId,
        isRead,
        route,
      },
    });

    io.to(partnerId).emit("notification", notification);
    
  } catch (error) {
    console.error("Error creating notification:", error);
  }
};
