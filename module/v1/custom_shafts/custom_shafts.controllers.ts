import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

import fs from "fs";
import { getImageUrl } from "../../../utils/base_utl";

const prisma = new PrismaClient();

export const createMaßschaftKollektion = async (
  req: Request,
  res: Response
) => {
  const files = req.files as any;

  try {
    const { name, price, catagoary, gender, description } = req.body;

    const missingField = [
      "name",
      "price",
      "catagoary",
      "gender",
      "description",
    ].find((field) => !req.body[field]);

    if (missingField) {
      res.status(400).json({
        success: false,
        message: `${missingField} is required!`,
      });
      return;
    }

    const randomIde = Math.floor(1000 + Math.random() * 9000).toString();

    const kollektion = await prisma.maßschaft_kollektion.create({
      data: {
        ide: randomIde,
        name,
        price: parseFloat(price),
        catagoary,
        gender,
        description,
        image: files?.image?.[0]?.filename || "",
      },
    });

    const formattedKollektion = {
      ...kollektion,
      image: kollektion.image
        ? getImageUrl(`/uploads/${kollektion.image}`)
        : null,
    };

    res.status(201).json({
      success: true,
      message: "Maßschaft Kollektion created successfully",
      data: formattedKollektion,
    });
  } catch (error: any) {
    console.error("Create Maßschaft Kollektion Error:", error);

    if (files?.image?.[0]?.path) {
      try {
        fs.unlinkSync(files.image[0].path);
      } catch (err) {
        console.error("Failed to delete file:", err);
      }
    }

    res.status(500).json({
      success: false,
      message: "Something went wrong while creating Maßschaft Kollektion",
      error: error.message,
    });
  }
};

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

export const getAllMaßschaftKollektion = async (
  req: Request,
  res: Response
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || "";
    const skip = (page - 1) * limit;

    // Build where condition for search
    const whereCondition: any = {};
    if (search) {
      whereCondition.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { catagoary: { contains: search, mode: "insensitive" } },
        { gender: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Get total count and kollektion data in parallel
    const [totalCount, kollektion] = await Promise.all([
      prisma.maßschaft_kollektion.count({ where: whereCondition }),
      prisma.maßschaft_kollektion.findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    // Format the response with image URLs
    const formattedKollektion = kollektion.map((item) => ({
      ...item,
      image: item.image ? getImageUrl(`/uploads/${item.image}`) : null,
    }));

    // Calculate pagination values
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json({
      success: true,
      message: "Maßschaft Kollektion fetched successfully",
      data: formattedKollektion,
      pagination: {
        totalItems: totalCount,
        totalPages,
        currentPage: page,
        itemsPerPage: limit,
        hasNextPage,
        hasPrevPage,
      },
    });
  } catch (error: any) {
    console.error("Get All Maßschaft Kollektion Error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong while fetching Maßschaft Kollektion",
      error: error.message,
    });
  }
};

export const updateMaßschaftKollektion = async (
  req: Request,
  res: Response
) => {
  const files = req.files as any;
  const { id } = req.params;

  const cleanupFiles = () => {
    if (!files?.image?.[0]?.path) return;
    try {
      fs.unlinkSync(files.image[0].path);
    } catch (err) {
      console.error(`Failed to delete file ${files.image[0].path}`, err);
    }
  };

  try {
    const existingKollektion = await prisma.maßschaft_kollektion.findUnique({
      where: { id },
    });

    if (!existingKollektion) {
      cleanupFiles();
      res.status(404).json({
        success: false,
        message: "Maßschaft Kollektion not found",
      });
      return;
    }

    const { name, price, catagoary, gender, description } = req.body;

    const updateData: any = {};

    if (name !== undefined) updateData.name = name;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (catagoary !== undefined) updateData.catagoary = catagoary;
    if (gender !== undefined) updateData.gender = gender;
    if (description !== undefined) updateData.description = description;

    if (files?.image?.[0]) {
      if (existingKollektion.image) {
        const oldImagePath = `uploads/${existingKollektion.image}`;
        if (fs.existsSync(oldImagePath)) {
          try {
            fs.unlinkSync(oldImagePath);
            console.log(`Deleted old image: ${oldImagePath}`);
          } catch (err) {
            console.error(`Failed to delete old image: ${oldImagePath}`, err);
          }
        }
      }
      updateData.image = files.image[0].filename;
    }

    if (Object.keys(updateData).length === 0) {
      cleanupFiles();
      res.status(400).json({
        success: false,
        message: "No valid fields provided for update",
      });
      return;
    }

    const updatedKollektion = await prisma.maßschaft_kollektion.update({
      where: { id },
      data: updateData,
    });

    const formattedKollektion = {
      ...updatedKollektion,
      image: updatedKollektion.image
        ? getImageUrl(`/uploads/${updatedKollektion.image}`)
        : null,
    };

    res.status(200).json({
      success: true,
      message: "Maßschaft Kollektion updated successfully",
      data: formattedKollektion,
    });
  } catch (error: any) {
    console.error("Update Maßschaft Kollektion Error:", error);
    cleanupFiles();

    if (error.code === "P2002") {
      res.status(400).json({
        success: false,
        message: "A kollektion with this name already exists",
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Something went wrong while updating Maßschaft Kollektion",
      error: error.message,
    });
  }
};


export const getMaßschaftKollektionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Find the kollektion by ID
    const kollektion = await prisma.maßschaft_kollektion.findUnique({
      where: { id },
    });

    // If not found, return 404
    if (!kollektion) {
      return res.status(404).json({
        success: false,
        message: "Maßschaft Kollektion not found",
      });
    }

    // Format the response with image URL
    const formattedKollektion = {
      ...kollektion,
      image: kollektion.image
        ? getImageUrl(`/uploads/${kollektion.image}`)
        : null,
    };

    res.status(200).json({
      success: true,
      message: "Maßschaft Kollektion fetched successfully",
      data: formattedKollektion,
    });
  } catch (error: any) {
    console.error("Get Maßschaft Kollektion By ID Error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong while fetching Maßschaft Kollektion",
      error: error.message,
    });
  }
};