import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import validator from "validator";
import { sendNewSuggestionEmail } from "../../utils/emailService.utils";

const prisma = new PrismaClient();

export const getAllSuggestions = async (req: Request, res: Response) => {
    try {
      const suggestions = await prisma.suggestion.findMany({
          orderBy: {
            createdAt: 'desc', // Newest first
          },
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        });
        
  
      res.status(200).json({
        success: true,
        suggestions
      });
    } catch (error) {
      console.error("Get all suggestions error:", error);
      res.status(500).json({
        success: false,
        message: "Something went wrong",
        error: error.message
      });
    }
  };
  