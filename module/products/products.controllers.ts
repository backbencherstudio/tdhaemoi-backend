import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { getImageUrl } from "../../utils/base_utl";
import { Multer } from "multer";
const prisma = new PrismaClient();

// -------------------------------------------
const normalizeGender = (gender: string) => {
  const g = gender.toUpperCase();
  return ["MALE", "FEMALE", "UNISEX"].includes(g) ? g : null;
};

const buildSearchQuery = (search: string) => {
  const isNumber = !isNaN(Number(search));
  return {
    OR: [
      { name: { contains: search, mode: "insensitive" } },
      { brand: { contains: search, mode: "insensitive" } },
      { size: { contains: search, mode: "insensitive" } },
      { Company: { contains: search, mode: "insensitive" } },
      {
        colors: {
          some: {
            OR: [
              { colorName: { contains: search, mode: "insensitive" } },
              { colorCode: { contains: search, mode: "insensitive" } }
            ]
          }
        }
      },
      ...(isNumber ? [{ price: { equals: Number(search) } }] : []),
    ],
  };
};

const buildFilterQuery = (query: any) => {
  const {
    name,
    brand,
    category,
    subCategory,
    typeOfShoes,
    offer,
    size,
    colorName,
    colorCode,
    company,
    gender,
    availability,
    minPrice,
    maxPrice,
  } = query;

  const where: any = {};

  if (name) where.name = { contains: name, mode: "insensitive" };
  if (brand) where.brand = { contains: brand, mode: "insensitive" };
  if (category) where.Category = { contains: category, mode: "insensitive" };
  if (subCategory) where.Sub_Category = { contains: subCategory, mode: "insensitive" };
  
  // Handle multiple types of shoes
  if (typeOfShoes) {
    const typeArray = Array.isArray(typeOfShoes) ? typeOfShoes : [typeOfShoes];
    where.typeOfShoes = {
      in: typeArray,
      mode: "insensitive"
    };
  }

  if (offer) where.offer = { contains: offer, mode: "insensitive" };
  
  // Handle multiple sizes
  if (size) {
    const sizeArray = Array.isArray(size) ? size : [size];
    where.size = {
      in: sizeArray,
      mode: "insensitive"
    };
  }

  // Handle multiple colors
  if (colorName || colorCode) {
    const colorNames = Array.isArray(colorName) ? colorName : colorName ? [colorName] : [];
    const colorCodes = Array.isArray(colorCode) ? colorCode : colorCode ? [colorCode] : [];

    where.colors = {
      some: {
        OR: [
          ...(colorNames.length > 0 ? [{
            colorName: {
              in: colorNames,
              mode: "insensitive"
            }
          }] : []),
          ...(colorCodes.length > 0 ? [{
            colorCode: {
              in: colorCodes,
              mode: "insensitive"
            }
          }] : [])
        ]
      }
    };
  }

  if (company) where.Company = { contains: company, mode: "insensitive" };
  if (gender) where.gender = normalizeGender(gender);
  if (availability !== undefined) where.availability = availability === "true";

  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = Number(minPrice);
    if (maxPrice) where.price.lte = Number(maxPrice);
  }

  return where;
};

const paginate = (limit: string, page: string) => {
  const itemsPerPage = Math.min(parseInt(limit), 50);
  const currentPage = Math.max(parseInt(page), 1);
  const skip = (currentPage - 1) * itemsPerPage;
  return { itemsPerPage, currentPage, skip };
};

const sortQuery = (sortBy: string, sortOrder: string) => {
  const allowed = ["createdAt", "price", "name", "brand"];
  const orderBy: any = {};
  if (allowed.includes(sortBy)) {
    orderBy[sortBy] = sortOrder === "asc" ? "asc" : "desc";
  } else {
    orderBy.createdAt = "desc";
  }
  return orderBy;
};

const formatProductsWithImageUrls = (products: any[]) =>
  products.map((product) => ({
    ...product,
    colors: product.colors.map((color) => ({
      ...color,
      images: color.images.map((image) => ({
        ...image,
        url: getImageUrl(`/uploads/${image.url}`),
      })),
    })),
  }));
// ----------------------------------------------------------

export const createProduct = async (req: Request, res: Response) => {
  try {
    const {
      name,
      brand,
      Category,
      Sub_Category,
      typeOfShoes,
      productDesc,
      price,
      availability,
      offer,
      size,
      feetFirstFit,
      footLength,
      technicalData,
      Company,
      gender,
      colors, // Expected as a stringified JSON from the frontend
    } = req.body;

    const files = req.files;

    // Validation: check required fields
    if (!name || !brand) {
       res.status(400).json({
        success: false,
        message: "Name and brand are required fields",
      });
      return
    }

    if (!files || !Array.isArray(files) || files.length === 0) {
       res.status(400).json({
        success: false,
        message: "No image files uploaded",
      });
      return
    }

    // Parse and validate colors JSON
    let parsedColors: any[] = [];
    try {
      parsedColors = colors ? JSON.parse(colors) : [];
    } catch {
      res.status(400).json({
        success: false,
        message: "Invalid colors JSON format",
      });
      return;
    }

    // Handle gender normalization
    const normalizedGender = normalizeGender(gender);

    // Parse numeric fields
    const numericPrice = price ? parseFloat(price) : null;
    const numericOffer = offer ? parseFloat(offer) : null;

    // Associate uploaded files with colors
    let fileIndex = 0;
    const colorsWithFiles = parsedColors.map((color) => {
      const imageFilenames: string[] = [];

      for (
        let i = 0;
        i < color.images.length && fileIndex < files.length;
        i++
      ) {
        imageFilenames.push(files[fileIndex].filename);
        fileIndex++;
      }

      return {
        colorName: color.colorName,
        colorCode: color.colorCode,
        images: imageFilenames,
      };
    });

    // Create the product and related nested data
    const createdProduct = await prisma.product.create({
      data: {
        name,
        brand,
        Category: Category || null,
        Sub_Category: Sub_Category || null,
        typeOfShoes: typeOfShoes || null,
        productDesc: productDesc || null,
        price: numericPrice,
        availability: availability === "true",
        offer: numericOffer,
        size: size || null,
        feetFirstFit: feetFirstFit || null,
        footLength: footLength || null,
        technicalData: technicalData || null,
        Company: Company || null,
        gender: normalizedGender as "MALE" | "FEMALE" | "UNISEX" | null,
        colors: {
          create: colorsWithFiles.map((color) => ({
            colorName: color.colorName,
            colorCode: color.colorCode,
            images: {
              create: color.images.map((filename) => ({
                url: filename,
              })),
            },
          })),
        },
      },
      include: {
        colors: {
          include: {
            images: true,
          },
        },
      },
    });

    // Attach full image URLs
    const productWithUrls = formatProductsWithImageUrls([createdProduct])[0];

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: productWithUrls,
    });
  } catch (error) {
    console.error("Create Product Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create product",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  console.log(req.body);
  try {
    const { id } = req.params;
    const {
      name,
      brand,
      Category,
      Sub_Category,
      typeOfShoes,
      productDesc,
      price,
      availability,
      offer,
      size,
      feetFirstFit,
      footLength,
      technicalData,
      Company,
      gender,
      colors,
    } = req.body;

    const files = req.files;

    const existingProduct = await prisma.product.findUnique({
      where: {
        id: String(id),
      },
      include: {
        colors: {
          include: {
            images: true,
          },
        },
      },
    });

    if (!existingProduct) {
      res.status(404).json({
        message: "Product not found",
      });
      return;
    }

    let parsedColors;
    try {
      parsedColors = colors ? JSON.parse(colors) : [];
    } catch (e) {
      res.status(400).json({
        success: false,
        message: "Invalid colors format",
      });
      return;
    }

    // Map uploaded files to colors while preserving existing images
    let fileIndex = 0;
    const colorsWithFiles = parsedColors.map((color: any) => {
      const colorImages = [];

      // If this is an existing color, include its existing images
      if (color.id) {
        const existingColor = existingProduct.colors.find(
          (ec) => ec.id === color.id
        );
        if (existingColor) {
          colorImages.push(...existingColor.images.map((img) => img.url));
        }
      }

      // Add new images
      if (color.images) {
        for (const image of color.images) {
          if (image.isNew && files && fileIndex < files.length) {
            colorImages.push(files[fileIndex].filename);
            fileIndex++;
          } else if (!image.isNew && image.filename) {
            colorImages.push(image.filename);
          }
        }
      }

      return {
        id: color.id,
        colorName: color.colorName,
        colorCode: color.colorCode,
        images: colorImages,
      };
    });

    // Update product with color handling
    const updatedProduct = await prisma.product.update({
      where: {
        id: String(id),
      },
      data: {
        name,
        brand,
        Category: Category || null,
        Sub_Category: Sub_Category || null,
        typeOfShoes: typeOfShoes || null,
        productDesc: productDesc || null,
        price: price ? parseFloat(price) : null,
        availability: availability === "true",
        offer: offer ? parseFloat(offer) : null,
        size: size || null,
        feetFirstFit: feetFirstFit || null,
        footLength: footLength || null,
        technicalData: technicalData || null,
        Company: Company || null,
        gender: gender
          ? (gender.toString().toUpperCase() as "MALE" | "FEMALE" | "UNISEX")
          : null,
        colors: {
          deleteMany: {}, // Delete all existing colors
          create: colorsWithFiles.map((color: any) => ({
            colorName: color.colorName,
            colorCode: color.colorCode,
            images: {
              create: color.images.map((filename: string) => ({
                url: filename,
              })),
            },
          })),
        },
      },
      include: {
        colors: {
          include: {
            images: true,
          },
        },
      },
    });

    const productWithUrls = {
      ...updatedProduct,
      colors: updatedProduct.colors.map((color) => ({
        ...color,
        images: color.images.map((image) => ({
          ...image,
          url: getImageUrl(`/uploads/${image.url}`),
        })),
      })),
    };

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: productWithUrls,
    });
  } catch (error) {
    console.error("Update Product Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update product",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        colors: {
          include: {
            images: true,
          },
        },
      },
    });

    const productsWithImageUrls = products.map((product) => ({
      ...product,
      colors: product.colors.map((color) => ({
        ...color,
        images: color.images.map((image) => ({
          ...image,
          url: getImageUrl(`/uploads/${image.url}`),
        })),
      })),
    }));

    res.status(200).json({
      success: true,
      products: productsWithImageUrls,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const deleteImage = async (req: Request, res: Response) => {
  const { id, imageName } = req.params;

  try {
    const image = await prisma.image.findFirst({
      where: {
        url: imageName,
        color: {
          productId: String(id),
        },
      },
      include: {
        color: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!image) {
      res.status(404).json({
        success: false,
        error: "Image not found in this product",
      });
      return;
    }

    const filePath = path.join(__dirname, "../../uploads", imageName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete the image record from database
    await prisma.image.delete({
      where: {
        id: image.id,
      },
    });

    res.json({
      success: true,
      message: "Image deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error instanceof Error ? error.message : error,
    });
  }
};

export const queryProducts = async (req: Request, res: Response) => {
  try {
    const {
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
      limit = "10",
      page = "1",
    } = req.query;

    const where = search
      ? buildSearchQuery(search as string)
      : buildFilterQuery(req.query);

    const orderBy = sortQuery(sortBy as string, sortOrder as string);
    const { itemsPerPage, currentPage, skip } = paginate(
      limit as string,
      page as string
    );

    const [products, totalCount] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        orderBy,
        take: itemsPerPage,
        skip,
        include: {
          colors: {
            include: {
              images: true,
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    const productsWithUrls = formatProductsWithImageUrls(products);
    const totalPages = Math.ceil(totalCount / itemsPerPage);

    res.status(200).json({
      success: true,
      products: productsWithUrls,
      pagination: {
        total: totalCount,
        currentPage,
        totalPages,
        itemsPerPage,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
      },
    });
  } catch (error) {
    console.error("Query Products Error:", error);
    res.status(500).json({
      success: false,
      message: "Error while querying products",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
// -----------------------------------------

export const deleteProduct = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const product = await prisma.product.findUnique({
      where: { id: String(id) },
      include: {
        colors: {
          include: {
            images: true,
          },
        },
      },
    });

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
      return;
    }

    for (const color of product.colors) {
      for (const image of color.images) {
        const filePath = path.join(__dirname, "../../uploads", image.url);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    }

    await prisma.product.delete({
      where: {
        id: String(id),
      },
    });

    res.status(200).json({
      success: true,
      message: "Product and associated images deleted successfully",
    });
  } catch (error) {
    console.error("Delete Product Error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error instanceof Error ? error.message : error,
    });
  }
};

// Basic filtering: /products/query?name=nike&brand=nike

// Price range: /products/query?minPrice=50&maxPrice=100

// Category filtering: /products/query?category=running&subCategory=trail

// Size and color: /products/query?size=10&color=black

// Pagination: /products/query?page=2&limit=10

// Sorting: /products/query?sortBy=price&sortOrder=desc

export const getSingleProduct = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const product = await prisma.product.findUnique({
      where: { id: String(id) },
      include: {
        colors: {
          include: {
            images: true,
          },
        },
      },
    });

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
      return;
    }

    const productWithImageUrls = {
      ...product,
      colors: product.colors.map((color) => ({
        ...color,
        images: color.images.map((image) => ({
          ...image,
          url: getImageUrl(`/uploads/${image.url}`),
        })),
      })),
    };

    res.status(200).json({
      success: true,
      product: productWithImageUrls,
    });
  } catch (error) {
    console.error("Get Single Product Error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error instanceof Error ? error.message : error,
    });
  }
};
 