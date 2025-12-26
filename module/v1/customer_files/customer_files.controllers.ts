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

const addFileEntry = (entries, row, field, table, rowId, createdAt) => {
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

// export const getCustomerFiles = async (req, res) => {
//   try {
//     // 1. READ FROM QUERY, NOT BODY
//     const customerId = req.query.id as string; // ← correct


  
//   //   {
//   //     "fieldName": "image",
//   //     "table": "customer_files",
//   //     "url": "071ee896-2e6b-4776-9e26-d73234cae793.stl",
//   //     "id": "abdb9ab5-c989-480c-b464-6b6adaab47a6",
//   //     "fileType": "stl",
//   //     "createdAt": "2025-11-10T11:13:33.686Z",
//   //     "fullUrl": "http://192.168.7.12:3001/uploads/071ee896-2e6b-4776-9e26-d73234cae793.stl"
//   // },

//     // i wanna query by table ?table=customer_files or ect
//     // custom_shafts screener_file customer_files
//     const table = req.query.table as string;


//     if (!customerId) {
//       return res.status(400).json({
//         success: false,
//         message: "customerId is required in query params",
//       });
//     }

//     console.log("Customer ID:", customerId);

//     const page = parseInt(req.query.page as string, 10) || 1;
//     const limit = parseInt(req.query.limit as string, 10) || 20;
//     const skip = (page - 1) * limit;


//     // Check if customer exists
//     const customer = await prisma.customers.findUnique({
//       where: { id: customerId },
//     });

//     if (!customer) {
//       return res.status(404).json({
//         success: false,
//         message: "Customer not found",
//       });
//     }

//     // -----------------------------------------------------------------
//     // 1. Fetch all relevant rows with createdAt
//     // -----------------------------------------------------------------
//     const [screenerRows, customShaftRows, customerFilesRows] =
//       await Promise.all([
//         prisma.screener_file.findMany({
//           where: { customerId },
//           orderBy: { createdAt: "desc" },
//           select: {
//             id: true,
//             createdAt: true,
//             picture_10: true,
//             picture_23: true,
//             threed_model_left: true,
//             picture_17: true,
//             picture_11: true,
//             picture_24: true,
//             threed_model_right: true,
//             picture_16: true,
//             csvFile: true,
//           },
//         }),
//         prisma.custom_shafts.findMany({
//           where: { customerId },
//           orderBy: { createdAt: "desc" },
//           select: {
//             id: true,
//             createdAt: true,
//             image3d_1: true,
//             image3d_2: true,
//           },
//         }),
//         prisma.customer_files.findMany({
//           where: { customerId },
//           orderBy: { createdAt: "desc" },
//           select: {
//             id: true,
//             createdAt: true,
//             url: true,
//           },
//         }),
//       ]);

//     // -----------------------------------------------------------------
//     // 2. Collect all file entries with createdAt
//     // -----------------------------------------------------------------
//     const allEntries = [];

//     // Screener Files
//     for (const row of screenerRows) {
//       const fields = [
//         "picture_10",
//         "picture_23",
//         "threed_model_left",
//         "picture_17",
//         "picture_11",
//         "picture_24",
//         "threed_model_right",
//         "picture_16",
//         "csvFile",
//       ] as const;

//       for (const field of fields) {
//         addFileEntry(
//           allEntries,
//           row,
//           field,
//           "screener_file",
//           row.id,
//           row.createdAt
//         );
//       }
//     }

//     // Custom Shafts
//     for (const row of customShaftRows) {
//       const fields = ["image3d_1", "image3d_2"] as const;
//       for (const field of fields) {
//         addFileEntry(
//           allEntries,
//           row,
//           field,
//           "custom_shafts",
//           row.id,
//           row.createdAt
//         );
//       }
//     }

//     // Customer Files (fieldName = "image")
//     for (const row of customerFilesRows) {
//       if (row.url) {
//         allEntries.push({
//           fieldName: "image",
//           table: "customer_files",
//           url: row.url,
//           id: row.id,
//           fileType: getFileType(row.url),
//           createdAt: row.createdAt,
//         });
//       }
//     }

//     // -----------------------------------------------------------------
//     // 3. Global sort by createdAt (latest first)
//     // -----------------------------------------------------------------
//     allEntries.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

//     // -----------------------------------------------------------------
//     // 4. Pagination
//     // -----------------------------------------------------------------
//     const total = allEntries.length;
//     const totalPages = Math.ceil(total / limit);
//     const paginatedEntries = allEntries.slice(skip, skip + limit);

//     // Optional: Add full URL
//     const baseUrl =
//       process.env.APP_URL || req.protocol + "://" + req.get("host");
//     paginatedEntries.forEach((entry) => {
//       entry.fullUrl = `${baseUrl}/uploads/${entry.url}`;
//     });

//     // -----------------------------------------------------------------
//     // 5. Response
//     // -----------------------------------------------------------------
//     const response = {
//       success: true,
//       message: "Files fetched successfully",
//       data: paginatedEntries,
//       pagination: {
//         page,
//         limit,
//         total,
//         totalPages,
//         hasNext: page < totalPages,
//         hasPrev: page > 1,
//       },
//     };

//     res.status(200).json(response);
//   } catch (error: any) {
//     console.error("Get Customer Files Error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };

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
      fullUrl: getImageUrl(`/uploads/${filename}`),
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


export const getCustomerFiles = async (req, res) => {
  try {
    const customerId = req.query.id as string;
    const table = (req.query.table as string) || "all"; // all, screener_file, custom_shafts, customer_files, barcode, insoelInvoice

    if (!customerId) {
      return res.status(400).json({
        success: false,
        message: "customerId is required in query params",
      });
    }

    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const skip = (page - 1) * limit;

    // Check if customer exists
    const customer = await prisma.customers.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    let screenerRows = [];
    let customShaftRows = [];
    let customerFilesRows = [];
    let barcodeRows = [];
    let invoiceRows = [];

    // Load only what user requested
    if (table === "all" || table === "screener_file") {
      screenerRows = await prisma.screener_file.findMany({
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
      });
    }

    if (table === "all" || table === "custom_shafts") {
      customShaftRows = await prisma.custom_shafts.findMany({
        where: { customerId },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          createdAt: true,
          image3d_1: true,
          image3d_2: true,
        },
      });
    }

    if (table === "all" || table === "customer_files") {
      customerFilesRows = await prisma.customer_files.findMany({
        where: { customerId },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          createdAt: true,
          url: true,
        },
      });
    }

    if (table === "all" || table === "barcode") {
      barcodeRows = await prisma.customerOrders.findMany({
        where: { customerId, barcodeLabel: { not: null } },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          createdAt: true,
          barcodeLabel: true,
        },
      });
    }

    if (table === "all" || table === "insoelInvoice") {
      invoiceRows = await prisma.customerOrders.findMany({
        where: { customerId, invoice: { not: null } },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          createdAt: true,
          invoice: true,
        },
      });
    }

    // Build final output
    const allEntries: any[] = [];

    // Screener File
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
        if (row[field]) {
          allEntries.push({
            fieldName: field,
            table: "screener_file",
            url: row[field],
            id: row.id,
            fileType: getFileType(row[field]),
            createdAt: row.createdAt,
          });
        }
      }
    }

    // Admin Order (custom shaft)
    for (const row of customShaftRows) {
      const fields = ["image3d_1", "image3d_2"] as const;

      for (const field of fields) {
        if (row[field]) {
          allEntries.push({
            fieldName: field,
            table: "custom_shafts",
            url: row[field],
            id: row.id,
            fileType: getFileType(row[field]),
            createdAt: row.createdAt,
          });
        }
      }
    }

    // Customer File
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

    // Barcode (from customerOrders)
    for (const row of barcodeRows) {
      if (row.barcodeLabel) {
        allEntries.push({
          fieldName: "barcodeLabel",
          table: "barcode",
          url: row.barcodeLabel,
          id: row.id,
          fileType: getFileType(row.barcodeLabel),
          createdAt: row.createdAt,
        });
      }
    }

    // Invoice (from customerOrders)
    for (const row of invoiceRows) {
      if (row.invoice) {
        allEntries.push({
          fieldName: "invoice",
          table: "insoelInvoice",
          url: row.invoice,
          id: row.id,
          fileType: getFileType(row.invoice),
          createdAt: row.createdAt,
        });
      }
    }

    // Sort newest first
    allEntries.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Pagination
    const total = allEntries.length;
    const totalPages = Math.ceil(total / limit);
    const paginatedEntries = allEntries.slice(skip, skip + limit);

    // Add full URL
    const baseUrl =
      process.env.APP_URL || req.protocol + "://" + req.get("host");

    paginatedEntries.forEach((entry) => {
      entry.fullUrl = `${baseUrl}/uploads/${entry.url}`;
    });

    res.status(200).json({
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
    });
  } catch (error) {
    console.error("Get Customer Files Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};


const UPLOADS_DIR = path.join(process.cwd(), "uploads"); // adjust if needed

// -----------------------------------------------------------------
// Helper: Delete file from disk
// -----------------------------------------------------------------
const deleteFileFromDisk = (filename: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const filePath = path.join(UPLOADS_DIR, filename);
    fs.unlink(filePath, (err) => {
      if (err && err.code !== "ENOENT") {
        console.error(`Failed to delete file: ${filePath}`, err);
        return reject(err);
      }
      resolve();
    });
  });
};

// -----------------------------------------------------------------
// Main Delete Controller
// -----------------------------------------------------------------
export const deleteCustomerFile = async (req: Request, res: Response) => {
  const { id, table, fieldName, url } = req.body;

  // Validate required fields
  if (!id || !table || !fieldName || !url) {
    return res.status(400).json({
      success: false,
      message: "id, table, fieldName, and url are required",
    });
  }

  // Validate table
  const allowedTables = [
    "screener_file",
    "custom_shafts",
    "customer_files",
  ] as const;
  if (!allowedTables.includes(table as any)) {
    return res.status(400).json({
      success: false,
      message: `Invalid table. Allowed: ${allowedTables.join(", ")}`,
    });
  }

  try {
    let deleted = false;
    let updated = false;

    // -----------------------------------------------------------------
    // Switch: Handle per table logic
    // -----------------------------------------------------------------
    switch (table) {
      case "customer_files":
        // Delete entire row + file
        const customerFile = await prisma.customer_files.findUnique({
          where: { id },
          select: { url: true },
        });

        if (!customerFile) {
          return res.status(404).json({
            success: false,
            message: "File record not found",
          });
        }

        await prisma.customer_files.delete({ where: { id } });
        await deleteFileFromDisk(url);
        deleted = true;
        break;

      case "screener_file":
        // Only null the specific field
        const validScreenerFields = [
          "picture_10",
          "picture_23",
          "threed_model_left",
          "picture_17",
          "picture_11",
          "picture_24",
          "threed_model_right",
          "picture_16",
          "csvFile",
        ];

        if (!validScreenerFields.includes(fieldName)) {
          return res.status(400).json({
            success: false,
            message: `Invalid field for screener_file: ${fieldName}`,
          });
        }

        const screenerRow = await prisma.screener_file.findUnique({
          where: { id },
          select: { [fieldName]: true },
        });

        if (!screenerRow || !screenerRow[fieldName]) {
          return res.status(404).json({
            success: false,
            message: "File not found in screener_file",
          });
        }

        await prisma.screener_file.update({
          where: { id },
          data: { [fieldName]: null },
        });

        await deleteFileFromDisk(url);
        updated = true;
        break;

      case "custom_shafts":
        // Only null the specific field
        const validShaftFields = ["image3d_1", "image3d_2"];
        if (!validShaftFields.includes(fieldName)) {
          return res.status(400).json({
            success: false,
            message: `Invalid field for custom_shafts: ${fieldName}`,
          });
        }

        const shaftRow = await prisma.custom_shafts.findUnique({
          where: { id },
          select: { [fieldName]: true },
        });

        if (!shaftRow || !shaftRow[fieldName]) {
          return res.status(404).json({
            success: false,
            message: "File not found in custom_shafts",
          });
        }

        await prisma.custom_shafts.update({
          where: { id },
          data: { [fieldName]: null },
        });

        await deleteFileFromDisk(url);
        updated = true;
        break;

      default:
        return res.status(400).json({
          success: false,
          message: "Unsupported table",
        });
    }

    // -----------------------------------------------------------------
    // Success Response
    // -----------------------------------------------------------------
    res.status(200).json({
      success: true,
      message: deleted
        ? "File and record deleted successfully"
        : "File removed and field updated successfully",
      data: {
        id,
        table,
        fieldName,
        url,
        action: deleted ? "deleted" : "field_cleared",
      },
    });
  } catch (error: any) {
    console.error("Delete Customer File Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete file",
      error: error.message,
    });
  }
};

// -----------------------------------------------------------------
// Update Customer File Controller
// -----------------------------------------------------------------
export const updateCustomerFile = async (req: Request, res: Response) => {
  const files = req.files as any;
  const { id, table, fieldName, oldUrl } = req.body;

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

  // Validate required fields
  if (!id || !table || !fieldName || !oldUrl) {
    cleanupFiles();
    return res.status(400).json({
      success: false,
      message: "id, table, fieldName, and oldUrl are required",
    });
  }

  // Validate table
  const allowedTables = [
    "screener_file",
    "custom_shafts",
    "customer_files",
  ] as const;
  if (!allowedTables.includes(table as any)) {
    cleanupFiles();
    return res.status(400).json({
      success: false,
      message: `Invalid table. Allowed: ${allowedTables.join(", ")}`,
    });
  }

  // Check if new file is uploaded
  if (!files || !files.image || !files.image[0]) {
    cleanupFiles();
    return res.status(400).json({
      success: false,
      message:
        "New file is required. Please upload a file with field name 'image'",
    });
  }

  try {
    const uploadedFile = files.image[0];
    const newFilename = uploadedFile.filename;

    // -----------------------------------------------------------------
    // Switch: Handle per table logic
    // -----------------------------------------------------------------
    switch (table) {
      case "customer_files": {
        // Find existing record
        const customerFile = await prisma.customer_files.findUnique({
          where: { id },
          select: { url: true, customerId: true, createdAt: true },
        });

        if (!customerFile) {
          cleanupFiles();
          return res.status(404).json({
            success: false,
            message: "File record not found",
          });
        }

        // Verify oldUrl matches
        if (customerFile.url !== oldUrl) {
          cleanupFiles();
          return res.status(400).json({
            success: false,
            message: "oldUrl does not match the current file URL",
          });
        }

        // Delete old file from disk
        await deleteFileFromDisk(oldUrl);

        // Update database with new file
        const updatedFile = await prisma.customer_files.update({
          where: { id },
          data: { url: newFilename },
        });

        const baseUrl =
          process.env.APP_URL || req.protocol + "://" + req.get("host");
        const formattedEntry = {
          fieldName: "image",
          table: "customer_files",
          url: newFilename,
          id: updatedFile.id,
          fileType: getFileType(newFilename),
          createdAt: updatedFile.createdAt,
          fullUrl: `${baseUrl}/uploads/${newFilename}`,
        };

        return res.status(200).json({
          success: true,
          message: "File updated successfully",
          data: formattedEntry,
        });
      }

      case "screener_file": {
        // Validate field
        const validScreenerFields = [
          "picture_10",
          "picture_23",
          "threed_model_left",
          "picture_17",
          "picture_11",
          "picture_24",
          "threed_model_right",
          "picture_16",
          "csvFile",
        ];

        if (!validScreenerFields.includes(fieldName)) {
          cleanupFiles();
          return res.status(400).json({
            success: false,
            message: `Invalid field for screener_file: ${fieldName}`,
          });
        }

        // Find existing record
        const screenerRow = await prisma.screener_file.findUnique({
          where: { id },
          select: { [fieldName]: true, createdAt: true },
        });

        if (!screenerRow || !screenerRow[fieldName]) {
          cleanupFiles();
          return res.status(404).json({
            success: false,
            message: "File not found in screener_file",
          });
        }

        // Verify oldUrl matches
        if (screenerRow[fieldName] !== oldUrl) {
          cleanupFiles();
          return res.status(400).json({
            success: false,
            message: "oldUrl does not match the current file URL",
          });
        }

        // Delete old file from disk
        await deleteFileFromDisk(oldUrl);

        // Update database with new file
        await prisma.screener_file.update({
          where: { id },
          data: { [fieldName]: newFilename },
        });

        const baseUrl =
          process.env.APP_URL || req.protocol + "://" + req.get("host");
        const formattedEntry = {
          fieldName,
          table: "screener_file",
          url: newFilename,
          id,
          fileType: getFileType(newFilename),
          createdAt: screenerRow.createdAt,
          fullUrl: `${baseUrl}/uploads/${newFilename}`,
        };

        return res.status(200).json({
          success: true,
          message: "File updated successfully",
          data: formattedEntry,
        });
      }

      case "custom_shafts": {
        // Validate field
        const validShaftFields = ["image3d_1", "image3d_2"];
        if (!validShaftFields.includes(fieldName)) {
          cleanupFiles();
          return res.status(400).json({
            success: false,
            message: `Invalid field for custom_shafts: ${fieldName}`,
          });
        }

        // Find existing record
        const shaftRow = await prisma.custom_shafts.findUnique({
          where: { id },
          select: { [fieldName]: true, createdAt: true },
        });

        if (!shaftRow || !shaftRow[fieldName]) {
          cleanupFiles();
          return res.status(404).json({
            success: false,
            message: "File not found in custom_shafts",
          });
        }

        // Verify oldUrl matches
        if (shaftRow[fieldName] !== oldUrl) {
          cleanupFiles();
          return res.status(400).json({
            success: false,
            message: "oldUrl does not match the current file URL",
          });
        }

        // Delete old file from disk
        await deleteFileFromDisk(oldUrl);

        // Update database with new file
        await prisma.custom_shafts.update({
          where: { id },
          data: { [fieldName]: newFilename },
        });

        const baseUrl =
          process.env.APP_URL || req.protocol + "://" + req.get("host");
        const formattedEntry = {
          fieldName,
          table: "custom_shafts",
          url: newFilename,
          id,
          fileType: getFileType(newFilename),
          createdAt: shaftRow.createdAt,
          fullUrl: `${baseUrl}/uploads/${newFilename}`,
        };

        return res.status(200).json({
          success: true,
          message: "File updated successfully",
          data: formattedEntry,
        });
      }

      default:
        cleanupFiles();
        return res.status(400).json({
          success: false,
          message: "Unsupported table",
        });
    }
  } catch (error: any) {
    console.error("Update Customer File Error:", error);
    cleanupFiles();
    res.status(500).json({
      success: false,
      message: "Failed to update file",
      error: error.message,
    });
  }
};
