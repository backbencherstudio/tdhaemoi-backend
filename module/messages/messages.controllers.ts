import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import validator from "validator";
import { sendEmail } from "../../utils/emailService.utils";

const prisma = new PrismaClient();

export const createMessage = async (req: Request, res: Response) => {
  try {
    const { email, subject, message } = req.body;
    const { id } = req.user;

    // Validate required fields
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

    // Validate email format
    if (!validator.isEmail(email)) {
      res.status(400).json({
        success: false,
        message: "Invalid email format!",
      });
      return;
    }

    // Create new message
    const newMessage = await prisma.messages.create({
      data: {
        email,
        subject,
        message,
        favorite: false,
        user: {
          connect: {
            id: id
          }
        }
      },
    });

    // Send email notification
    await sendEmail(
      email,
      subject,
      message
    );

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
      error: error.message
    });
  }
};
  