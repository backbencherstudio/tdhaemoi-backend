import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { getImageUrl } from "../../utils/base_utl";
import { Multer } from 'multer';
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

    const imageUrls = product.images.map((image) => getImageUrl(`/uploads/${image}`));

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
        if (files) {
          files.forEach((file) => {
            fs.unlinkSync(path.join(__dirname, "../../uploads", file.filename));
          });
        }
         res.status(404).json({ message: "Product not found" });
         return
      }
  
      // If new images are uploaded, remove the old ones
      if (newImages.length > 0) {
        if (existingProduct.images && Array.isArray(existingProduct.images)) {
          existingProduct.images.forEach((image) => {
            const imagePath = path.join(__dirname, "../../uploads", image);
            if (fs.existsSync(imagePath)) {
              fs.unlinkSync(imagePath);
            }
          });
        }
      }
  
      const updateData: any = {
        ...req.body,
        availability: req.body.availability === "true",
      };
  
      if (newImages.length > 0) {
        updateData.images = newImages;
      }
  
      const updatedProduct = await prisma.product.update({
        where: { id: Number(id) },
        data: updateData,
      });
  
      const imageUrls = updatedProduct.images.map((image) => getImageUrl(`/uploads/${image}`));
  
      res.status(200).json({
        success: true,
        message: "Product updated successfully",
        product: {
          ...updatedProduct,
          images: imageUrls,
        },
      });
    } catch (error) {
      // Rollback image uploads on error
      const files = req.files as Multer.File[];
      files?.forEach((file) => {
        const filePath = path.join(__dirname, "../../uploads", file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
  
      res.status(500).json({
        success: false,
        message: "Something went wrong",
        error,
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