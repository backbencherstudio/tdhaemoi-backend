import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { getImageUrl } from "../../utils/base_utl";
import { Multer } from "multer";
const prisma = new PrismaClient();

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
      color,
      technicalData,
      Company,
      gender,
    } = req.body;

    const files = req.files as Multer.File[];
    const images = files ? files.map((file) => file.filename) : [];

    // Convert price and offer to numbers
    const numericPrice = price ? parseFloat(price) : null;
    const numericOffer = offer ? parseFloat(offer) : null;

    const product = await prisma.product.create({
      data: {
        name: name || null,
        brand: brand || null,
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
        color: color || null,
        technicalData: technicalData || null,
        Company: Company || null,
        gender: gender ? (gender.toUpperCase() as any) : null,
        images,
      },
    });

    const imageUrls = product.images.map((image) =>
      getImageUrl(`/uploads/${image}`)
    );

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: {
        ...product,
        images: imageUrls,
      },
    });
  } catch (error) {
    if (req.files) {
      const files = req.files as Multer.File[];
      files.forEach((file) => {
        const filePath = path.join(__dirname, "../../uploads", file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }
    console.error("Create Product Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create product",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const files = req.files as Multer.File[];
    const newImages = files ? files.map((file) => file.filename) : [];

    const existingProduct = await prisma.product.findUnique({
      where: { id: Number(id) },
    });

    if (!existingProduct) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    const updateData: any = {
      ...req.body,
      availability: req.body.availability === "true",
    };

    // Combine existing images with new ones
    updateData.images = [...(existingProduct.images || []), ...newImages];

    const updatedProduct = await prisma.product.update({
      where: { id: Number(id) },
      data: updateData,
    });

    const imageUrls = updatedProduct.images.map((image) =>
      getImageUrl(`/uploads/${image}`)
    );

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: {
        ...updatedProduct,
        images: imageUrls,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error instanceof Error ? error.message : error,
    });
  }
};

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    const productsWithImageUrls = products.map((product) => ({
      ...product,
      images: product.images.map((image) => getImageUrl(`/uploads/${image}`)),
    }));

    res.status(200).json({
      success: true,
      products: productsWithImageUrls,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error,
    });
  }
};

export const deleteImage = async (req: Request, res: Response) => {
  const { id, imageName } = req.params;

  try {
    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
    });

    if (!product) {
      res.status(404).json({ success: false, error: "Product not found" });
      return;
    }

    const imageExists = product.images.includes(imageName);
    if (!imageExists) {
      res.status(404).json({
        success: false,
        error: "Image not found in this post",
      });
      return;
    }

    const filePath = path.join(__dirname, "../../uploads", imageName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    const updatedProduct = await prisma.product.update({
      where: { id: Number(id) },
      data: {
        images: product.images.filter((img) => img !== imageName),
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

// export const queryProducts = async (req: Request, res: Response) => {
//   try {
//     const {
//       name,
//       brand,
//       category,
//       subCategory,
//       typeOfShoes,
//       minPrice,
//       maxPrice,
//       offer,
//       size,
//       color,
//       company,
//       gender,
//       availability,
//       sortBy = "createdAt",
//       sortOrder = "desc",
//       limit = "10",
//       page = "1",
//     } = req.query;

//     const where: any = {};

//     // Filter conditions
//     if (name) where.name = { contains: name as string, mode: "insensitive" };
//     if (brand) where.brand = { contains: brand as string, mode: "insensitive" };
//     if (category) where.Category = { contains: category as string, mode: "insensitive" };
//     if (subCategory) where.Sub_Category = { contains: subCategory as string, mode: "insensitive" };
//     if (typeOfShoes) where.typeOfShoes = { contains: typeOfShoes as string, mode: "insensitive" };
//     if (offer) where.offer = { contains: offer as string, mode: "insensitive" };
//     if (size) where.size = { contains: size as string, mode: "insensitive" };
//     if (color) where.color = { contains: color as string, mode: "insensitive" };
//     if (company) where.Company = { contains: company as string, mode: "insensitive" };
//     if (gender) {
//       const normalizedGender = gender.toString().toUpperCase();
//       if (['MALE', 'FEMALE', 'UNISEX'].includes(normalizedGender)) {
//         where.gender = normalizedGender;
//       }
//     }
//     if (availability) where.availability = availability === "true";

//     // Price range filter
//     if (minPrice || maxPrice) {
//       where.price = {};
//       if (minPrice) where.price.gte = Number(minPrice);
//       if (maxPrice) where.price.lte = Number(maxPrice);
//     }

//     // Sorting options
//     const allowedSortFields = ['createdAt', 'price', 'name', 'brand'];
//     const orderBy: any = {};

//     if (sortBy && allowedSortFields.includes(sortBy as string)) {
//       orderBy[sortBy as string] = sortOrder === 'asc' ? 'asc' : 'desc';
//     } else {
//       orderBy.createdAt = 'desc';
//     }

//     // Pagination
//     const itemsPerPage = Math.min(parseInt(limit as string), 50); // Limit maximum items per page
//     const currentPage = Math.max(parseInt(page as string), 1); // Ensure page is at least 1
//     const skip = (currentPage - 1) * itemsPerPage;

//     const [products, totalCount] = await prisma.$transaction([
//       prisma.product.findMany({
//         where,
//         orderBy,
//         take: itemsPerPage,
//         skip,
//       }),
//       prisma.product.count({ where }),
//     ]);

//     // Convert images to URLs
//     const productsWithImageUrls = products.map((product) => ({
//       ...product,
//       images: product.images.map((image) => getImageUrl(`/uploads/${image}`)),
//     }));

//     const totalPages = Math.ceil(totalCount / itemsPerPage);

//     res.status(200).json({
//       success: true,
//       products: productsWithImageUrls,
//       pagination: {
//         total: totalCount,
//         currentPage,
//         totalPages,
//         itemsPerPage,
//         hasNextPage: currentPage < totalPages,
//         hasPreviousPage: currentPage > 1
//       }
//     });
//   } catch (error) {
//     console.error('Query Products Error:', error);
//     res.status(500).json({
//       success: false,
//       message: "Error while querying products",
//       error: error instanceof Error ? error.message : 'Unknown error'
//     });
//   }
// };

export const queryProducts = async (req: Request, res: Response) => {
  try {
    const {
      name,
      brand,
      category,
      subCategory,
      typeOfShoes,
      minPrice,
      maxPrice,
      offer,
      size,
      color,
      company,
      gender,
      availability,
      search, // New search parameter
      sortBy = "createdAt",
      sortOrder = "desc",
      limit = "10",
      page = "1",
    } = req.query;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: "insensitive" } },
        { brand: { contains: search as string, mode: "insensitive" } },
        { size: { contains: search as string, mode: "insensitive" } },
        { Company: { contains: search as string, mode: "insensitive" } },
        ...(isNaN(Number(search))
          ? []
          : [{ price: { equals: Number(search) } }]),
      ];
    } else {
      if (name) where.name = { contains: name as string, mode: "insensitive" };
      if (brand)
        where.brand = { contains: brand as string, mode: "insensitive" };
      if (category)
        where.Category = { contains: category as string, mode: "insensitive" };
      if (subCategory)
        where.Sub_Category = {
          contains: subCategory as string,
          mode: "insensitive",
        };
      if (typeOfShoes)
        where.typeOfShoes = {
          contains: typeOfShoes as string,
          mode: "insensitive",
        };
      if (offer)
        where.offer = { contains: offer as string, mode: "insensitive" };
      if (size) where.size = { contains: size as string, mode: "insensitive" };
      if (color)
        where.color = { contains: color as string, mode: "insensitive" };
      if (company)
        where.Company = { contains: company as string, mode: "insensitive" };
    }

    if (gender) {
      const normalizedGender = gender.toString().toUpperCase();
      if (["MALE", "FEMALE", "UNISEX"].includes(normalizedGender)) {
        where.gender = normalizedGender;
      }
    }
    if (availability) where.availability = availability === "true";

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = Number(minPrice);
      if (maxPrice) where.price.lte = Number(maxPrice);
    }

    const allowedSortFields = ["createdAt", "price", "name", "brand"];
    const orderBy: any = {};

    if (sortBy && allowedSortFields.includes(sortBy as string)) {
      orderBy[sortBy as string] = sortOrder === "asc" ? "asc" : "desc";
    } else {
      orderBy.createdAt = "desc";
    }

    const itemsPerPage = Math.min(parseInt(limit as string), 50);
    const currentPage = Math.max(parseInt(page as string), 1);
    const skip = (currentPage - 1) * itemsPerPage;

    const [products, totalCount] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        orderBy,
        take: itemsPerPage,
        skip,
      }),
      prisma.product.count({ where }),
    ]);

    const productsWithImageUrls = products.map((product) => ({
      ...product,
      images: product.images.map((image) => getImageUrl(`/uploads/${image}`)),
    }));

    const totalPages = Math.ceil(totalCount / itemsPerPage);

    res.status(200).json({
      success: true,
      products: productsWithImageUrls,
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

export const deleteProduct = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
    });

    if (!product) {
      res.status(404).json({ success: false, message: "Product not found" });
      return;
    }

    for (const image of product.images) {
      const filePath = path.join(__dirname, "../../uploads", image);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await prisma.product.delete({
      where: { id: Number(id) },
    });

    res.status(200).json({
      success: true,
      message: "Product and images deleted successfully",
    });
  } catch (error) {
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
      where: { id: Number(id) },
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
      images: product.images.map((image) => getImageUrl(`/uploads/${image}`)),
    };

    res.status(200).json({
      success: true,
      product: productWithImageUrls,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error instanceof Error ? error.message : error,
    });
  }
};
