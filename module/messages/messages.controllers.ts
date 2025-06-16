import { Request, Response } from "express";
import validator from "validator";
import { sendEmail } from "../../utils/emailService.utils";
import { PrismaClient, Prisma } from "@prisma/client";

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
      select: {
        id: true,
      },
    });
    console.log(recipientUser);

    const newMessage = await prisma.messages.create({
      data: {
        email,
        subject,
        message,
        favorite: false,
        user: {
          connect: {
            id: senderId,
          },
        },
        recipient_id: recipientUser?.id || null,
      },
    });

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

// http://192.168.0.0:3001/message/me?page=1&limit=5&search=wefind
export const getSentMessages = async (req: Request, res: Response) => {
  try {
    const { id: senderId } = req.user;

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string)?.trim() || "";

    const skip = (page - 1) * limit;

    const baseWhere: Prisma.MessagesWhereInput = {
      userId: senderId,
      ...(search && {
        OR: [
          {
            email: {
              contains: search,
              mode: Prisma.QueryMode.insensitive,
            },
          },
          {
            subject: {
              contains: search,
              mode: Prisma.QueryMode.insensitive,
            },
          },
          {
            message: {
              contains: search,
              mode: Prisma.QueryMode.insensitive,
            },
          },
        ],
      }),
    };

    const [messages, total] = await prisma.$transaction([
      prisma.messages.findMany({
        where: baseWhere,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          subject: true,
          message: true,
          createdAt: true,
        },
      }),
      prisma.messages.count({
        where: baseWhere,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      message: "Sent messages fetched successfully",
      data: messages,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Fetch sent messages error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

export const getReceivedMessages = async (req: Request, res: Response) => {
  try {
    const { id: recipientId } = req.user;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string)?.trim() || "";
    const skip = (page - 1) * limit;
    const baseWhere: Prisma.MessagesWhereInput = {
      recipient_id: recipientId,
      ...(search && {
        OR: [
          {
            email: {
              contains: search,
              mode: Prisma.QueryMode.insensitive,
            },
          },
          {
            subject: {
              contains: search,
              mode: Prisma.QueryMode.insensitive,
            },
          },
          {
            message: {
              contains: search,
              mode: Prisma.QueryMode.insensitive,
            },  
          },
        ],
      }),
    };
    const [messages, total] = await prisma.$transaction([
      prisma.messages.findMany({
        where: baseWhere,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          subject: true,
          message: true,
          createdAt: true,
          favorite: true,
        },
      }), 
      prisma.messages.count({
        where: baseWhere,
      }),
    ]);
    const totalPages = Math.ceil(total / limit);
    res.status(200).json({
      success: true,
      message: "Received messages fetched successfully",
      data: messages,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Fetch received messages error:", error);
    res.status(500).json({  
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  } 
};

// export const favoriteMessage = async (req: Request, res: Response) => {
//   try {
//     const { id: messageId } = req.params;
//     const { id: userId } = req.user;
//     const message = await prisma.messages.findUnique({
//       where: { id: messageId },
//     });
//     if (!message) {
//        res.status(404).json({
//         success: false,
//         message: "Message not found",
//       });
//       return
//     }
//     if (message.userId !== userId) {
//        res.status(403).json({
//         success: false,
//         message: "You do not have permission to favorite this message",
//       });
//       return
//     }
//     const updatedMessage = await prisma.messages.update({
//       where: { id: messageId },
//       data: { favorite: true },
//     });
//     res.status(200).json({
//       success: true,
//       message: "Message favorited successfully",
//       data: updatedMessage,
//     });
//   } catch (error) {
//     console.error("Favorite message error:", error);
//     res.status(500).json({  
//       success: false,
//       message: "Something went wrong",
//       error: error.message,
//     });
//   }
// };


export const favoriteMessage = async (req: Request, res: Response) => {
  try {
    const { id: messageId } = req.params;
    const { id: userId } = req.user;

    // Check if the message exists
    const message = await prisma.messages.findUnique({ where: { id: messageId } });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Check if the user has permission to favorite the message
    const visibility = await prisma.messageVisibility.findUnique({
      where: { messageId_userId: { messageId, userId } },
    });

    if (!visibility) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to favorite this message",
      });
    }

    // Update favorite status only for the user
    const updatedVisibility = await prisma.messageVisibility.update({
      where: { messageId_userId: { messageId, userId } },
      data: { isFavorite: true },
    });

    return res.status(200).json({
      success: true,
      message: "Message favorited successfully",
      data: updatedVisibility,
    });
  } catch (error) {
    console.error("Favorite message error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};


export const deleteMessage = async (req: Request, res: Response) => {
  try {
    const { id: messageId } = req.params;
    const { id: userId } = req.user;  
    const message = await prisma.messages.findUnique({
      where: { id: messageId },
    }); 
    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }
    if (message.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to delete this message",
      });
    } 
    await prisma.messages.delete({
      where: { id: messageId },
    });
    res.status(200).json({  
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    console.error("Delete message error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// export const getMessageById = async (req: Request, res: Response) => {
//   try {
//     const { id: messageId } = req.params;
//     const { id: userId } = req.user;
//     const message = await prisma.messages.findUnique({
//       where: { id: messageId },
//       select: {
//         id: true, 
//         email: true,
//         subject: true,
//         message: true,
//         createdAt: true,
//         favorite: true,
//         user: {
//           select: {
//             id: true,
//             name: true,
//             email: true,
//           },
//         },
//         recipient: {
//           select: {
//             id: true,
//             name: true,
//             email: true,
//           },
//         },
//       },
//     });
//     if (!message) {
//       return res.status(404).json({
//         success: false,
//         message: "Message not found",
//       });
//     }
//     if (message.userId !== userId && message.recipient_id !== userId) {
//       return res.status(403).json({
//         success: false,
//         message: "You do not have permission to view this message",
//       });
//     }
//     res.status(200).json({
//       success: true,
//       message: "Message fetched successfully",
//       data: message,
//     });
//   } catch (error) {
//     console.error("Fetch message by ID error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Something went wrong",
//       error: error.message,
//     });
//   }
// };