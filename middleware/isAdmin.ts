import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.user;

    const user = await prisma.user.findUnique({
      where: { id: String(id) },
    });

    if (!user || user.role !== "ADMIN") {
      return res.status(403).json({
        message: "Access denied. Admin only.",
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
      error,
    });
  }
};