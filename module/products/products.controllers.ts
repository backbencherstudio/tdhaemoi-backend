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

    const product = await prisma.product.create({
      data: {
        name,
        brand,
        Category,
        Sub_Category,
        typeOfShoes,
        productDesc,
        price,
        availability: availability === "true",
        offer,
        size,
        feetFirstFit,
        footLength,
        color,
        technicalData,
        Company,
        gender: gender || null,
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
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error,
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
    const products = await prisma.product.findMany();

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
    // 1. Find the product
    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
    });

    if (!product) {
      res.status(404).json({ success: false, error: "Product not found" });
      return;
    }

    // 2. Check if the image exists in product.images
    const imageExists = product.images.includes(imageName);
    if (!imageExists) {
      res.status(404).json({
        success: false,
        error: "Image not found in this post",
      });
      return;
    }

    // 3. Remove image from filesystem
    const filePath = path.join(__dirname, "../../uploads", imageName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // 4. Remove image from database
    const updatedProduct = await prisma.product.update({
      where: { id: Number(id) },
      data: {
        images: product.images.filter((img) => img !== imageName),
      },
    });

    // 5. Return success response
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
      sortBy,
      sortOrder = 'asc',
      limit,
      page = 1,
    } = req.query;

    const where: any = {};

    if (name) where.name = { contains: name as string, mode: 'insensitive' };
    if (brand) where.brand = { contains: brand as string, mode: 'insensitive' };
    if (category) where.Category = { contains: category as string, mode: 'insensitive' };
    if (subCategory) where.Sub_Category = { contains: subCategory as string, mode: 'insensitive' };
    if (typeOfShoes) where.typeOfShoes = { contains: typeOfShoes as string, mode: 'insensitive' };
    if (offer) where.offer = { contains: offer as string, mode: 'insensitive' };
    if (size) where.size = { contains: size as string, mode: 'insensitive' };
    if (color) where.color = { contains: color as string, mode: 'insensitive' };
    if (company) where.Company = { contains: company as string, mode: 'insensitive' };
    if (gender) where.gender = gender as any;
    if (availability) where.availability = availability === 'true';

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = minPrice as string;
      if (maxPrice) where.price.lte = maxPrice as string;
    }

    // Sorting options
    const orderBy: any = {};
    if (sortBy) {
      orderBy[sortBy as string] = sortOrder;
    } else {
      orderBy.createdAt = 'desc'; // Default sort by newest
    }

    // Pagination
    const take = limit ? parseInt(limit as string) : undefined;
    const skip = take ? (parseInt(page as string) - 1) * take : undefined;

    const [products, totalCount] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        orderBy,
        take,
        skip,
      }),
      prisma.product.count({ where }),
    ]);

    // Convert images to URLs
    const productsWithImageUrls = products.map((product) => ({
      ...product,
      images: product.images.map((image) => getImageUrl(`/uploads/${image}`)),
    }));

    res.status(200).json({
      success: true,
      products: productsWithImageUrls,
      total: totalCount,
      page: parseInt(page as string),
      totalPages: take ? Math.ceil(totalCount / take) : 1,
      nextPage: take ? parseInt(page as string) < Math.ceil(totalCount / take) : false,
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

