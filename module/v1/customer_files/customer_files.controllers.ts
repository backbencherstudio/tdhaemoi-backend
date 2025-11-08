import fs from "fs";
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import path from "path";
import { getImageUrl } from "../../../utils/base_utl";

const prisma = new PrismaClient();


// -----------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------
const getFileType = (filename: string): string => {
  const ext = path.extname(filename).toLowerCase();
  return ext.startsWith(".") ? ext.slice(1) : ext;
};

const addFileEntry = (
  entries,
  row,
  field,
  table,
  rowId,
  createdAt
) => {
  const url = row[field];
  if (url && typeof url === "string") {
    entries.push({
      fieldName: field,
      table,
      url,
      id: rowId,
      fileType: getFileType(url),
      createdAt,
    });
  }
};

export const getCustomerFiles = async (req, res) => {
  try {
    const { customerId } = req.body;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    if (!customerId) {
      return res.status(400).json({
        success: false,
        message: "customerId is required",
      });
    }

    if (page < 1 || limit < 1) {
      return res.status(400).json({
        success: false,
        message: "page and limit must be positive integers",
      });
    }

    // -----------------------------------------------------------------
    // 1. Fetch all relevant rows with createdAt
    // -----------------------------------------------------------------
    const [screenerRows, customShaftRows, customerFilesRows] = await Promise.all([
      prisma.screener_file.findMany({
        where: { customerId },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          createdAt: true,
          picture_10: true,
          picture_23: true,
          threed_model_left: true,
          picture_17: true,
          picture_11: true,
          picture_24: true,
          threed_model_right: true,
          picture_16: true,
          csvFile: true,
        },
      }),
      prisma.custom_shafts.findMany({
        where: { customerId },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          createdAt: true,
          image3d_1: true,
          image3d_2: true,
        },
      }),
      prisma.customer_files.findMany({
        where: { customerId },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          createdAt: true,
          url: true,
        },
      }),
    ]);

    // -----------------------------------------------------------------
    // 2. Collect all file entries with createdAt
    // -----------------------------------------------------------------
    const allEntries = [];

    // Screener Files
    for (const row of screenerRows) {
      const fields = [
        "picture_10",
        "picture_23",
        "threed_model_left",
        "picture_17",
        "picture_11",
        "picture_24",
        "threed_model_right",
        "picture_16",
        "csvFile",
      ] as const;

      for (const field of fields) {
        addFileEntry(allEntries, row, field, "screener_file", row.id, row.createdAt);
      }
    }

    // Custom Shafts
    for (const row of customShaftRows) {
      const fields = ["image3d_1", "image3d_2"] as const;
      for (const field of fields) {
        addFileEntry(allEntries, row, field, "custom_shafts", row.id, row.createdAt);
      }
    }

    // Customer Files (fieldName = "image")
    for (const row of customerFilesRows) {
      if (row.url) {
        allEntries.push({
          fieldName: "image",
          table: "customer_files",
          url: row.url,
          id: row.id,
          fileType: getFileType(row.url),
          createdAt: row.createdAt,
        });
      }
    }

    // -----------------------------------------------------------------
    // 3. Global sort by createdAt (latest first)
    // -----------------------------------------------------------------
    allEntries.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // -----------------------------------------------------------------
    // 4. Pagination
    // -----------------------------------------------------------------
    const total = allEntries.length;
    const totalPages = Math.ceil(total / limit);
    const paginatedEntries = allEntries.slice(skip, skip + limit);

    // Optional: Add full URL
    const baseUrl = process.env.APP_URL || req.protocol + "://" + req.get("host");
    paginatedEntries.forEach((entry) => {
      entry.fullUrl = `${baseUrl}/uploads/${entry.url}`;
    });

    // -----------------------------------------------------------------
    // 5. Response
    // -----------------------------------------------------------------
    const response = {
      success: true,
      message: "Files fetched successfully",
      data: paginatedEntries,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error("Get Customer Files Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};;

export const createCustomerFile = async (req: Request, res: Response) => {
  const files = req.files as any;

  const cleanupFiles = () => {
    if (!files) return;
    Object.keys(files).forEach((key) => {
      files[key].forEach((file: any) => {
        try {
          fs.unlinkSync(file.path);
        } catch (err) {
          console.error(`Failed to delete file ${file.path}`, err);
        }
      });
    });
  };

  try {
    const { customerId } = req.params;

    if (!customerId) {
      cleanupFiles();
      return res.status(400).json({
        success: false,
        message: "customerId is required",
      });
    }

    // Check if customer exists
    const customer = await prisma.customers.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      cleanupFiles();
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // Check if file is uploaded
    if (!files || !files.image || !files.image[0]) {
      cleanupFiles();
      return res.status(400).json({
        success: false,
        message:
          "File is required. Please upload a file with field name 'image'",
      });
    }

    const uploadedFile = files.image[0];
    const filename = uploadedFile.filename;

    // Create customer file record
    const customerFile = await prisma.customer_files.create({
      data: {
        customerId,
        url: filename,
      },
    });

    // Helper to get file extension
    const getFileType = (filename: string) => {
      const ext = path.extname(filename).toLowerCase();
      return ext.startsWith(".") ? ext.slice(1) : ext;
    };

    const fileType = getFileType(filename);

    const formattedEntry = {
      fieldName: "image",
      table: "customer_files",
      url: filename,
      id: customerFile.id,
      fileType,
    };

    res.status(201).json({
      success: true,
      message: "Customer file created successfully",
      data: formattedEntry,
    });
  } catch (error: any) {
    console.error("Create Customer File Error:", error);
    cleanupFiles();
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};
