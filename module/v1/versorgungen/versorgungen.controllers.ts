import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createVersorgungen = async (req: Request, res: Response) => {
  try {
    const {
      name,
      rohlingHersteller,
      artikelHersteller,
      versorgung,
      material,
      langenempfehlung,
      status,
    } = req.body;

    const missingField = [
      "name",
      "rohlingHersteller",
      "artikelHersteller",
      "versorgung",
      "material",
      "langenempfehlung",
      "status",
    ].find((field) => !req.body[field]);

    if (missingField) {
      return res.status(400).json({
        success: false,
        message: `${missingField} is required!`,
      });
    }

    const versorgungenData = {
      name,
      rohlingHersteller,
      artikelHersteller,
      versorgung,
      material,
      langenempfehlung,
      status,
      createdBy: req.user.id,
    };

    const newVersorgungen = await prisma.versorgungen.create({
      data: versorgungenData,
    });

    res.status(201).json({
      success: true,
      message: "Versorgungen created successfully",
      versorgungen: newVersorgungen,
    });
  } catch (error) {
    console.error("Create Versorgungen error:", error);
    res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went wrong",
      error: error.message,
    });
  }
};
