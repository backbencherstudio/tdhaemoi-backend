import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createBestellubersicht = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.user;
    const { number } = req.body;

    const bestellubersicht = await prisma.bestellubersicht.upsert({
      where: { userId: id },
      update: {
        number,
        updatedAt: new Date(),
      },
      create: {
        number,
        user: { connect: { id } },
      },
    });

    res.status(200).json({
      success: true,
      message: "Bestellübersicht updated successfully.",
      data: bestellubersicht,
    });
    
  } catch (err: any) {
    console.error("Error creating/updating Bestellübersicht:", err);
    res.status(500).json({
      success: false,
      message: "Something went wrong!",
      error: err.message,
    });
  }
};
