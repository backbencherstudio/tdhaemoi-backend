import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

import fs from "fs";
import { getImageUrl } from "../../../utils/base_utl";

const prisma = new PrismaClient();

export const createTustomShafts = async (req: Request, res: Response) => {
  const files = req.files as any;

  try {
    const {
      customerId,
      lederfarbe,
      innenfutter,
      schafthohe,
      polsterung,
      vestarkungen,
      polsterung_text,
      vestarkungen_text,
    } = req.body;

    if (customerId) {
      const customer = await prisma.customers.findUnique({
        where: { id: customerId },
      });

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: "Customer not found",
        });
      }

      const existingCustomShaft = await prisma.customers.findUnique({
        where: { id: customerId },
      });

      if (existingCustomShaft) {
        return res.status(400).json({
          success: false,
          message: "Custom shaft already exists for this customer",
        });
      }
    }

    const customShaft = await prisma.custom_shafts.create({
      data: {
        image3d_1: files.image3d_1?.[0]?.filename || null,
        image3d_2: files.image3d_2?.[0]?.filename || null,
        customerId: customerId || null,
        lederfarbe: lederfarbe || null,
        innenfutter: innenfutter || null,
        schafthohe: schafthohe || null,
        polsterung: polsterung || null,
        vestarkungen: vestarkungen || null,
        polsterung_text: polsterung_text || null,
        vestarkungen_text: vestarkungen_text || null,
      },
    });

    const formattedCustomShaft = {
      ...customShaft,
      image3d_1: customShaft.image3d_1
        ? getImageUrl(`/uploads/${customShaft.image3d_1}`)
        : null,
      image3d_2: customShaft.image3d_2
        ? getImageUrl(`/uploads/${customShaft.image3d_2}`)
        : null,
    };

    res.status(201).json({
      success: true,
      message: "Custom shaft created successfully",
      data: formattedCustomShaft,
    });
  } catch (err: any) {
    console.error("Create Custom Shaft Error:", err);

    if (files) {
      Object.keys(files).forEach((key) => {
        files[key].forEach((file: any) => {
          try {
            fs.unlinkSync(file.path);
          } catch (error) {
            console.error(`Failed to delete file ${file.path}`, error);
          }
        });
      });
    }

    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: err.message,
    });
  }
};
