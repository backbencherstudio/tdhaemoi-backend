import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { data } from "../../../assets/v1/data";

const prisma = new PrismaClient();

export const createCustomerHistoryNote = async (
  req: Request,
  res: Response
) => {
  try {
    const { note } = req.body;
    const { customerId } = req.params;

    if (!note) {
      return res.status(400).json({
        success: false,
        message: "Note is required",
      });
    }

    if (!customerId) {
      return res.status(400).json({
        success: false,
        message: "customerId parameter is required",
      });
    }

    const customer = await prisma.customers.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const customerHistory = await prisma.customerHistorie.create({
      data: {
        customer: {
          connect: { id: customerId },
        },
        category: "Notizen",
        note: note,
      },
      select: {
        id: true,
        customerId: true,
        category: true,
        note: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(201).json({
      success: true,
      message: "Customer history note created successfully",
      data: customerHistory,
    });
  } catch (error: any) {
    console.error("Create Customer History Note Error:", error);
    res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went wrong",
      error: error.message,
    });
  }
};

export const getAllCustomerHistory = async (req: Request, res: Response) => {
  const validEventCategories = [
    "Notizen",
    "Bestellungen",
    "Leistungen",
    "Rechnungen",
    "Zahlungen",
    "Emails",
    "Termin",
  ];
  try {
    const { page = 1, limit = 10, customerId, category } = req.query;

    const pageNumber = parseInt(page as string);
    const limitNumber = parseInt(limit as string);
    const skip = (pageNumber - 1) * limitNumber;

    if (category && !validEventCategories.includes(category as string)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category value",
        error: `Category must be one of: ${validEventCategories.join(", ")}`,
        validCategories: validEventCategories,
      });
    }

    const whereCondition: any = {};

    if (customerId) {
      whereCondition.customerId = customerId as string;
    }

    if (category) {
      whereCondition.category = category as string;
    }

    const [history, totalCount] = await Promise.all([
      prisma.customerHistorie.findMany({
        where: whereCondition,
        skip,
        take: limitNumber,
        orderBy: { createdAt: "desc" },
      }),
      prisma.customerHistorie.count({ where: whereCondition }),
    ]);

    res.status(200).json({
      success: true,
      message: "Customer history retrieved successfully",
      data: history,
      pagination: {
        totalItems: totalCount,
        totalPages: Math.ceil(totalCount / limitNumber),
        currentPage: pageNumber,
        itemsPerPage: limitNumber,
        hasNextPage: pageNumber < Math.ceil(totalCount / limitNumber),
        hasPrevPage: pageNumber > 1,
      },
    });
  } catch (error: any) {
    console.error("Get All Customer History Error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  } finally {
    await prisma.$disconnect();
  }
};

export const getCustomerHistoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const history = await prisma.customerHistorie.findUnique({
      where: { id },
    });

    if (!history) {
      return res.status(404).json({
        success: false,
        message: "Customer history not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Customer history retrieved successfully",
      data: history,
    });
  } catch (error: any) {
    console.error("Get Customer History By ID Error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  } finally {
    await prisma.$disconnect();
  }
};
