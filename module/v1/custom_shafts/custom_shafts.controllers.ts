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

export const getMaßschaftKollektionById = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const kollektion = await prisma.maßschaft_kollektion.findUnique({
      where: { id },
    });

    if (!kollektion) {
      return res.status(404).json({
        success: false,
        message: "Maßschaft Kollektion not found",
      });
    }

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

export const deleteMaßschaftKollektion = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const existingKollektion = await prisma.maßschaft_kollektion.findUnique({
      where: { id },
    });

    if (!existingKollektion) {
      return res.status(404).json({
        success: false,
        message: "Maßschaft Kollektion not found",
      });
    }

    if (existingKollektion.image) {
      const imagePath = `uploads/${existingKollektion.image}`;
      if (fs.existsSync(imagePath)) {
        try {
          fs.unlinkSync(imagePath);
          console.log(`Deleted image file: ${imagePath}`);
        } catch (err) {
          console.error(`Failed to delete image file: ${imagePath}`, err);
        }
      }
    }

    await prisma.maßschaft_kollektion.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: "Maßschaft Kollektion deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete Maßschaft Kollektion Error:", error);

    if (error.code === "P2003") {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete this kollektion because it is being used elsewhere in the system",
      });
    }

    res.status(500).json({
      success: false,
      message: "Something went wrong while deleting Maßschaft Kollektion",
      error: error.message,
    });
  }
};

// ----------------------------

export const createTustomShafts = async (req: Request, res: Response) => {
  const files = req.files as any;
  const { id } = req.user;

  try {
    const {
      customerId,
      mabschaftKollektionId,
      lederfarbe,
      innenfutter,
      schafthohe,
      polsterung,
      vestarkungen,
      polsterung_text,
      vestarkungen_text,
      nahtfarbe,
      nahtfarbe_text,
      lederType,
    } = req.body;

    // Early validation
    if (!customerId && !mabschaftKollektionId) {
      return res.status(400).json({
        success: false,
        message: "Either customerId or maßschaftKollektionId must be provided",
      });
    }

    // Run validations in parallel
    const [customer, kollektion] = await Promise.all([
      customerId
        ? prisma.customers.findUnique({
            where: { id: customerId },
            select: { id: true }, // Only select what you need
          })
        : Promise.resolve(null),

      mabschaftKollektionId
        ? prisma.maßschaft_kollektion.findUnique({
            where: { id: mabschaftKollektionId },
            select: { id: true }, // Only select what you need
          })
        : Promise.resolve(null),
    ]);

    // Validate results
    if (customerId && !customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    if (mabschaftKollektionId && !kollektion) {
      return res.status(404).json({
        success: false,
        message: "Maßschaft Kollektion not found",
      });
    }

    // Prepare data object
    const shaftData = {
      image3d_1: files.image3d_1?.[0]?.filename || null,
      image3d_2: files.image3d_2?.[0]?.filename || null,
      customerId: customer ? customerId : null,
      maßschaftKollektionId: kollektion ? mabschaftKollektionId : null,
      lederfarbe: lederfarbe || null,
      innenfutter: innenfutter || null,
      schafthohe: schafthohe || null,
      polsterung: polsterung || null,
      vestarkungen: vestarkungen || null,
      polsterung_text: polsterung_text || null,
      vestarkungen_text: vestarkungen_text || null,
      nahtfarbe: nahtfarbe || null,
      nahtfarbe_text: nahtfarbe_text || null,
      lederType: lederType || null,
      partnerId: id,
      orderNumber: `MS-${new Date().getFullYear()}-${Math.floor(
        10000 + Math.random() * 90000
      )}`,
    };

    // Create the custom shaft
    const customShaft = await prisma.custom_shafts.create({
      data: shaftData,
      include: {
        customer: {
          select: {
            id: true,
            vorname: true,
            nachname: true,
            email: true,
          },
        },
        maßschaft_kollektion: {
          select: {
            id: true,
            name: true,
            price: true,
            image: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    // Format response (non-blocking)
    const formattedCustomShaft = {
      ...customShaft,
      image3d_1: customShaft.image3d_1
        ? getImageUrl(`/uploads/${customShaft.image3d_1}`)
        : null,
      image3d_2: customShaft.image3d_2
        ? getImageUrl(`/uploads/${customShaft.image3d_2}`)
        : null,
      maßschaft_kollektion: customShaft.maßschaft_kollektion
        ? {
            ...customShaft.maßschaft_kollektion,
            image: customShaft.maßschaft_kollektion.image
              ? getImageUrl(
                  `/uploads/${customShaft.maßschaft_kollektion.image}`
                )
              : null,
          }
        : null,
      partner: customShaft.user
        ? {
            ...customShaft.user,
            image: customShaft.user.image
              ? getImageUrl(`/uploads/${customShaft.user.image}`)
              : null,
          }
        : null,
    };

    const { user, ...finalFormattedShaft } = formattedCustomShaft;

    // Send response immediately
    res.status(201).json({
      success: true,
      message: "Custom shaft created successfully",
      data: finalFormattedShaft,
    });
  } catch (err: any) {
    console.error("Create Custom Shaft Error:", err);

    // File cleanup (non-blocking)
    if (files) {
      Object.keys(files).forEach((key) => {
        files[key].forEach((file: any) => {
          fs.unlink(file.path, (error) => {
            if (error)
              console.error(`Failed to delete file ${file.path}`, error);
          });
        });
      });
    }

    if (err.code === "P2003") {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID or Maßschaft Kollektion ID provided",
      });
    }

    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: err.message,
    });
  }
};

export const getTustomShafts = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || "";
    const skip = (page - 1) * limit;

    const whereCondition: any = {};

    if (search) {
      whereCondition.OR = [
        { lederfarbe: { contains: search, mode: "insensitive" } },
        { innenfutter: { contains: search, mode: "insensitive" } },
        { schafthohe: { contains: search, mode: "insensitive" } },
        { polsterung: { contains: search, mode: "insensitive" } },
        { vestarkungen: { contains: search, mode: "insensitive" } },
        { polsterung_text: { contains: search, mode: "insensitive" } },
        { vestarkungen_text: { contains: search, mode: "insensitive" } },
        { nahtfarbe: { contains: search, mode: "insensitive" } },
        { nahtfarbe_text: { contains: search, mode: "insensitive" } },
        { lederType: { contains: search, mode: "insensitive" } },

        //
        {
          customer: {
            OR: [
              { vorname: { contains: search, mode: "insensitive" } },
              { nachname: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
              { telefon: { contains: search, mode: "insensitive" } },
              { ort: { contains: search, mode: "insensitive" } },
              { land: { contains: search, mode: "insensitive" } },
            ],
          },
        },
        {
          maßschaft_kollektion: {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { catagoary: { contains: search, mode: "insensitive" } },
              { gender: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
            ],
          },
        },
        {
          user: {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          },
        },
      ];
    }

    const [totalCount, customShafts] = await Promise.all([
      prisma.custom_shafts.count({
        where: whereCondition,
      }),
      prisma.custom_shafts.findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          customer: {
            select: {
              id: true,
              customerNumber: true,
              vorname: true,
              nachname: true,
              email: true,
              telefon: true,
              ort: true,
              land: true,
              straße: true,
              geburtsdatum: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          maßschaft_kollektion: {
            select: {
              id: true,
              ide: true,
              name: true,
              price: true,
              image: true,
              catagoary: true,
              gender: true,
              description: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      }),
    ]);

    const formattedCustomShafts = customShafts.map(({ user, ...shaft }) => ({
      ...shaft,
      image3d_1: shaft.image3d_1
        ? getImageUrl(`/uploads/${shaft.image3d_1}`)
        : null,
      image3d_2: shaft.image3d_2
        ? getImageUrl(`/uploads/${shaft.image3d_2}`)
        : null,
      customer: shaft.customer
        ? {
            ...shaft.customer,
          }
        : null,
      maßschaft_kollektion: shaft.maßschaft_kollektion
        ? {
            ...shaft.maßschaft_kollektion,
            image: shaft.maßschaft_kollektion.image
              ? getImageUrl(`/uploads/${shaft.maßschaft_kollektion.image}`)
              : null,
          }
        : null,
      partner: user
        ? {
            ...user,
            image: user.image ? getImageUrl(`/uploads/${user.image}`) : null,
          }
        : null,
    }));

    // Calculate pagination values
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json({
      success: true,
      message: "Custom shafts fetched successfully",
      data: formattedCustomShafts,
      pagination: {
        totalItems: totalCount,
        totalPages: totalPages,
        currentPage: page,
        itemsPerPage: limit,
        hasNextPage: hasNextPage,
        hasPrevPage: hasPrevPage,
      },
    });
  } catch (error: any) {
    console.error("Get Custom Shafts Error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong while fetching custom shafts",
      error: error.message,
    });
  }
};

export const getSingleCustomShaft = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Custom shaft ID is required",
      });
    }

    const customShaft = await prisma.custom_shafts.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            customerNumber: true,
            vorname: true,
            nachname: true,
            email: true,
            telefon: true,
            ort: true,
            land: true,
            straße: true,
            geburtsdatum: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        maßschaft_kollektion: {
          select: {
            id: true,
            ide: true,
            name: true,
            price: true,
            image: true,
            catagoary: true,
            gender: true,
            description: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    if (!customShaft) {
      return res.status(404).json({
        success: false,
        message: "Custom shaft not found",
      });
    }

    // Extract user first
    const { user, ...shaftWithoutUser } = customShaft;

    // Format the response
    const formattedShaft = {
      ...shaftWithoutUser,
      image3d_1: customShaft.image3d_1
        ? getImageUrl(`/uploads/${customShaft.image3d_1}`)
        : null,
      image3d_2: customShaft.image3d_2
        ? getImageUrl(`/uploads/${customShaft.image3d_2}`)
        : null,
      customer: customShaft.customer
        ? {
            ...customShaft.customer,
          }
        : null,
      maßschaft_kollektion: customShaft.maßschaft_kollektion
        ? {
            ...customShaft.maßschaft_kollektion,
            image: customShaft.maßschaft_kollektion.image
              ? getImageUrl(
                  `/uploads/${customShaft.maßschaft_kollektion.image}`
                )
              : null,
          }
        : null,
      partner: user
        ? {
            ...user,
            image: user.image ? getImageUrl(`/uploads/${user.image}`) : null,
          }
        : null,
    };

    res.status(200).json({
      success: true,
      message: "Custom shaft fetched successfully",
      data: formattedShaft,
    });
  } catch (error: any) {
    console.error("Get Single Custom Shaft Error:", error);

    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Custom shaft not found",
      });
    }

    res.status(500).json({
      success: false,
      message: "Something went wrong while fetching the custom shaft",
      error: error.message,
    });
  }
};
