import { Request, Response } from "express";
import validator from "validator";
import { sendEmail } from "../../utils/emailService.utils";
import { PrismaClient, Prisma } from "@prisma/client";
import { getImageUrl } from "../../utils/base_utl";
import { log } from "console";

const prisma = new PrismaClient();

export const createMessage = async (req: Request, res: Response) => {
  try {
    const { email, subject, message } = req.body;
    const { id: senderId } = req.user;

    const missingField = ["email", "subject", "message"].find(
      (field) => !req.body[field]
    );
    if (missingField) {
      res.status(400).json({
        success: false,
        message: `${missingField} is required!`,
      });
      return;
    }

    if (!validator.isEmail(email)) {
      res.status(400).json({
        success: false,
        message: "Invalid email format!",
      });
      return;
    }

    const recipientUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    const newMessage = await prisma.messages.create({
      data: {
        email,
        subject,
        message,
        user: { connect: { id: senderId } },
        ...(recipientUser?.id && {
          recipient: { connect: { id: recipientUser.id } },
        }),
      },
    });

    await prisma.messageVisibility.upsert({
      where: {
        messageId_userId: {
          messageId: newMessage.id,
          userId: senderId,
        },
      },
      create: {
        userId: senderId,
        messageId: newMessage.id,
      },
      update: {},
    });

    if (recipientUser) {
      await prisma.messageVisibility.upsert({
        where: {
          messageId_userId: {
            messageId: newMessage.id,
            userId: recipientUser.id,
          },
        },
        create: {
          userId: recipientUser.id,
          messageId: newMessage.id,
        },
        update: {},
      });
    }

    sendEmail(email, subject, message);

    res.status(201).json({
      success: true,
      message: "Message created successfully",
      data: newMessage,
    });
  } catch (error) {
    console.error("Create message error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

 

export const getSentMessages = async (req: Request, res: Response) => {
  try {
    const { id: userId } = req.user;

    // Get all messages sent by the user that haven't been deleted by the sender
    const sentMessages = await prisma.messages.findMany({
      where: {
        userId, // Messages sent by this user
        MessageVisibility: {
          some: {
            userId,
            isDeleted: false // Only include messages not deleted by the sender
          }
        }
      },
      include: {
        recipient: { // Include recipient details if available
          select: {
            id: true,
            name: true,
            // email: true,
            image: true,
            role: true
          }
        },
        MessageVisibility: {
          where: {
            userId
          },
          select: {
            isFavorite: true,
            isDeleted: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });


    const formattedMessages = sentMessages.map(message => ({
      ...message,
      isFavorite: message.MessageVisibility[0]?.isFavorite || false,
      recipient: message.recipient ? {
        ...message.recipient,
        image: message.recipient.image ? getImageUrl(`/uploads/${message.recipient.image}`) : null
      } : null
    }));

    res.status(200).json({
      success: true,
      message: "Sent messages retrieved successfully",
      data: formattedMessages
    });
  } catch (error) {
    console.error("Get sent messages error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong while fetching sent messages",
      error: error.message
    });
  }
};


export const getReceivedMessages = async (req: Request, res: Response) => {
  try {
    const { id: userId, email } = req.user;

    const receivedMessages = await prisma.messages.findMany({
      where: {
        OR: [
          { recipient_id: userId },
          { 
            email,
            NOT: { userId }
          }
        ],
        MessageVisibility: {
          some: {
            userId,
            isDeleted: false
          }
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true
          }
        },
        MessageVisibility: {
          where: {
            userId
          },
          select: {
            isFavorite: true,
            isDeleted: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc' 
      }
    });

    const formattedMessages = receivedMessages.map(message => ({
      ...message,
      isFavorite: message.MessageVisibility[0]?.isFavorite || false,
      user: message.user ? {
        ...message.user,
        image: message.user.image ? getImageUrl(`/uploads/${message.user.image}`) : null
      } : null
    }));

    res.status(200).json({
      success: true,
      message: "Received messages retrieved successfully",
      data: formattedMessages
    });
  } catch (error) {
    console.error("Get received messages error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong while fetching received messages",
      error: error.message
    });
  }
};


export const favoriteMessage = async (req: Request, res: Response) => {};
