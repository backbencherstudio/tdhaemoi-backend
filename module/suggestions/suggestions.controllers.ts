import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import validator from "validator";
import { sendNewSuggestionEmail } from "../../utils/emailService.utils";

const prisma = new PrismaClient();

export const createSuggestions = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, firma, suggestion } = req.body;
    const { id } = req.user;

    const missingField = ["name", "email", "phone", "firma", "suggestion"].find(
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

    const newSuggestion = await prisma.suggestion.create({
      data: {
        name,
        email,
        phone,
        firma,
        suggestion,
        userId: id,
      },
    });
    await sendNewSuggestionEmail(name, email, phone, firma, suggestion);
    res.status(201).json({
      success: true,
      message: "Suggestion created successfully",
      suggestion: newSuggestion,
    });
  } catch (error) {
    console.error("Create suggestion error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message
    });
  }
};

export const getAllSuggestions = async (req: Request, res: Response) => {
  try {
    const suggestions = await prisma.suggestion.findMany({
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

export const deleteSuggestion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const suggestion = await prisma.suggestion.findUnique({
      where: { id }
    });

    if (!suggestion) {
       res.status(404).json({
        success: false,
        message: "Suggestion not found"
      });
      return
    }

    await prisma.suggestion.delete({
      where: { id }
    });

    res.status(200).json({
      success: true,
      message: "Suggestion deleted successfully"
    });
  } catch (error) {
    console.error("Delete suggestion error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message
    });
  }
};

export const deleteAllSuggestions = async (req: Request, res: Response) => {
  try {
    await prisma.suggestion.deleteMany();

    res.status(200).json({
      success: true,
      message: "All suggestions deleted successfully"
    });
  } catch (error) {
    console.error("Delete all suggestions error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message
    });
  }
};
