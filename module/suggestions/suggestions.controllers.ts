import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import validator from "validator";
import {
  sendImprovementEmail,
  sendNewSuggestionEmail,
} from "../../utils/emailService.utils";

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

    const newSuggestion = await prisma.suggestionFeetf1rst.create({
      data: {
        name,
        email,
        phone,
        firma,
        suggestion,
        user: {
          connect: {
            id: id,
          },
        },
      },
    });

    sendNewSuggestionEmail(name, email, phone, firma, suggestion);
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
      error: error.message,
    });
  }
};

export const getAllSuggestions = async (req: Request, res: Response) => {
  try {
    const suggestions = await prisma.suggestionFeetf1rst.findMany({
      orderBy: {
        createdAt: "desc", // Newest first
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      suggestions,
    });
  } catch (error) {
    console.error("Get all suggestions error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

export const deleteSuggestion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const suggestion = await prisma.suggestionFeetf1rst.findUnique({
      where: { id },
    });

    if (!suggestion) {
      res.status(404).json({
        success: false,
        message: "Suggestion not found",
      });
      return;
    }

    await prisma.suggestionFeetf1rst.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: "Suggestion deleted successfully",
    });
  } catch (error) {
    console.error("Delete suggestion error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

export const deleteAllSuggestions = async (req: Request, res: Response) => {
  try {
    await prisma.suggestionFeetf1rst.deleteMany();

    res.status(200).json({
      success: true,
      message: "All suggestions deleted successfully",
    });
  } catch (error) {
    console.error("Delete all suggestions error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};


// model ImprovementSuggestion {
//   id         String   @id @default(uuid())
//   name       String
//   email      String
//   firma      String
//   phone      String
//   suggestion String

//   user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
//   userId     String
//   createdAt  DateTime @default(now())
// }

export const createImprovement = async (req: Request, res: Response) => {
  try {
    const { name, email, firma, phone, suggestion } = req.body;
    const { id: userId } = req.user;

    const missingField = ["name", "email", "firma", "phone", "suggestion"].find(
      (field) => !req.body[field]
    );

    if (missingField) {
      res.status(400).json({
        success: false,
        message: `${missingField} is required!`,
      });
      return;
    }

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(400).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    // Map request fields to model fields


    const newImprovement = await prisma.improvementSuggestion.create({
      data: {
        name,
        email,
        firma,
        phone,
        suggestion,
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });

    sendImprovementEmail(name, email, firma, suggestion);

    res.status(201).json({
      success: true,
      message: "Improvement suggestion created successfully",
      improvement: newImprovement,
    });
  } catch (error) {
    console.error("Create improvement suggestion error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

export const getAllImprovements = async (req: Request, res: Response) => {
  try {
    const improvements = await prisma.improvementSuggestion.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      improvements,
    });
  } catch (error) {
    console.error("Get all improvement suggestions error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

export const deleteImprovement = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const improvement = await prisma.improvementSuggestion.findUnique({
      where: { id },
    });

    if (!improvement) {
      res.status(404).json({
        success: false,
        message: "Improvement suggestion not found",
      });
      return;
    }

    await prisma.improvementSuggestion.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: "Improvement suggestion deleted successfully",
    });
  } catch (error) {
    console.error("Delete improvement suggestion error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

export const deleteAllImprovements = async (req: Request, res: Response) => {
  try {
    await prisma.improvementSuggestion.deleteMany();

    res.status(200).json({
      success: true,
      message: "All improvement suggestions deleted successfully",
    });
  } catch (error) {
    console.error("Delete all improvement suggestions error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};
