import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import iconv from "iconv-lite";
import csvParser from "csv-parser";
import { getImageUrl } from "../../../utils/base_utl";
import path from "path";

const prisma = new PrismaClient();

const targetCells = [
  "B58",
  "C58",
  "B73",
  "C73",
  "B102",
  "C102",
  "B105",
  "C105",
  "B136",
  "C136",
  "B120",
  "C120",
];

async function parseCSV(csvPath: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const results: any = {};
    let currentRow = 0;

    fs.createReadStream(csvPath)
      .pipe(iconv.decodeStream("utf16le"))
      .pipe(csvParser({ separator: "\t", headers: false }))
      .on("data", (row) => {
        currentRow++;

        targetCells.forEach((cell) => {
          const col = cell.charAt(0); // B or C
          const rowNum = parseInt(cell.slice(1));

          if (currentRow === rowNum) {
            const colIndex = col === "B" ? 1 : 2;
            results[cell] = row[colIndex] || "";
          }
        });
      })
      .on("end", () => resolve(results))
      .on("error", (err) => reject(err));
  });
}

export const createCustomers = async (req: Request, res: Response) => {
  try {
    const missingField = ["vorname", "nachname", "email"].find(
      (field) => !req.body[field]
    );

    if (missingField) {
      return res.status(400).json({
        success: false,
        message: `${missingField} is required!`,
      });
    }

    const { vorname, nachname, email, telefonnummer, wohnort } = req.body;

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

    const existingCustomer = await prisma.customers.findUnique({
      where: { email },
    });

    if (existingCustomer) {
      cleanupFiles();
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    //Get file names
    const picture_10 = files.picture_10?.[0]?.filename || null;
    const picture_23 = files.picture_23?.[0]?.filename || null;
    const threed_model_left = files.threed_model_left?.[0]?.filename || null;
    const picture_17 = files.picture_17?.[0]?.filename || null;
    const picture_11 = files.picture_11?.[0]?.filename || null;
    const picture_24 = files.picture_24?.[0]?.filename || null;
    const threed_model_right = files.threed_model_right?.[0]?.filename || null;
    const picture_16 = files.picture_16?.[0]?.filename || null;

    // Parse CSV if present
    let csvData: any = {};
    if (files.csvFile && files.csvFile[0]) {
      const csvPath = files.csvFile[0].path;
      console.log("Parsing CSV file:", csvPath);
      csvData = await parseCSV(csvPath);
      fs.unlinkSync(csvPath);
    }

    // Save to DB
    const customer = await prisma.customers.create({
      data: {
        vorname,
        nachname,
        email,
        telefonnummer: telefonnummer || null,
        wohnort: wohnort || null,
        picture_10,
        picture_23,
        threed_model_left,
        picture_17,
        picture_11,
        picture_24,
        threed_model_right,
        picture_16,

        // Save the extracted CSV values
        fusslange1: csvData.B58 || null,
        fusslange2: csvData.C58 || null,
        fussbreite1: csvData.B73 || null,
        fussbreite2: csvData.C73 || null,
        kugelumfang1: csvData.B102 || null,
        kugelumfang2: csvData.C102 || null,
        rist1: csvData.B105 || null,
        rist2: csvData.C105 || null,
        archIndex1: csvData.B120 || null,
        archIndex2: csvData.C120 || null,
        zehentyp1: csvData.B136 || null,
        zehentyp2: csvData.C136 || null,

        createdBy: req.user.id,
        updatedBy: null,
      },
    });


     const customerWithImages = {
      ...customer,
      picture_10: customer.picture_10 ? getImageUrl(`/uploads/${customer.picture_10}`) : null,
      picture_23: customer.picture_23 ? getImageUrl(`/uploads/${customer.picture_23}`) : null,
      picture_11: customer.picture_11 ? getImageUrl(`/uploads/${customer.picture_11}`) : null,
      picture_24: customer.picture_24 ? getImageUrl(`/uploads/${customer.picture_24}`) : null,
      threed_model_left: customer.threed_model_left ? getImageUrl(`/uploads/${customer.threed_model_left}`) : null,
      threed_model_right: customer.threed_model_right ? getImageUrl(`/uploads/${customer.threed_model_right}`) : null,
      picture_17: customer.picture_17 ? getImageUrl(`/uploads/${customer.picture_17}`) : null,
      picture_16: customer.picture_16 ? getImageUrl(`/uploads/${customer.picture_16}`) : null,
    };

    res.status(201).json({
      success: true,
      message: "Customer created successfully",
      data: customerWithImages,
    });
  } catch (err: any) {
    console.error("Create Customer Error:", err);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: err.message,
    });
  }
};

export const getAllCustomers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || "";
    const skip = (page - 1) * limit;

    // Filter condition
    const whereCondition: any = {};
    if (search) {
      whereCondition.OR = [
        { vorname: { contains: search, mode: "insensitive" } },
        { nachname: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    //  Fetch data and total count
    const [customers, totalCount] = await Promise.all([
      prisma.customers.findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { versorgungen: true },
      }),
      prisma.customers.count({ where: whereCondition }),
    ]);

    // Add image URLs
    const customersWithImages = customers.map((c) => ({
      ...c,
      picture_10: c.picture_10 ? getImageUrl(`/uploads/${c.picture_10}`) : null,
      picture_23: c.picture_23 ? getImageUrl(`/uploads/${c.picture_23}`) : null,
      picture_11: c.picture_11 ? getImageUrl(`/uploads/${c.picture_11}`) : null,
      picture_24: c.picture_24 ? getImageUrl(`/uploads/${c.picture_24}`) : null,
      threed_model_left: c.threed_model_left
        ? getImageUrl(`/uploads/${c.threed_model_left}`)
        : null,
      threed_model_right: c.threed_model_right
        ? getImageUrl(`/uploads/${c.threed_model_right}`)
        : null,
    }));

    res.status(200).json({
      success: true,
      message: "Customers fetched successfully",
      data: customersWithImages,
      pagination: {
        totalItems: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
        itemsPerPage: limit,
      },
    });
  } catch (error: any) {
    console.error("Get All Customers error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

export const deleteCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const customer = await prisma.customers.findUnique({
      where: { id },
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const fileFields = [
      customer.picture_10,
      customer.picture_23,
      customer.picture_17,
      customer.picture_11,
      customer.picture_24,
      customer.picture_16,
      customer.threed_model_left,
      customer.threed_model_right,
    ];

    fileFields.forEach((file) => {
      if (file) {
        const filePath = `uploads/${file}`;
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    });

    await prisma.customers.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: "Customer deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete Customer Error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.customers.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const files = req.files as any;
    const {
      vorname,
      nachname,
      email,
      telefonnummer,
      wohnort,
      fusslange1,
      fusslange2,
      fussbreite1,
      fussbreite2,
      kugelumfang1,
      kugelumfang2,
      rist1,
      rist2,
      zehentyp1,
      zehentyp2,
      archIndex1,
      archIndex2,
      ausfuhrliche_diagnose,
    } = req.body;

    const deleteOldIfNew = (newFile: any, oldFileName: string | null) => {
      if (newFile && oldFileName) {
        const oldPath = path.join(process.cwd(), "uploads", oldFileName);
        if (fs.existsSync(oldPath)) {
          try {
            fs.unlinkSync(oldPath);
            console.log(`Deleted old file: ${oldPath}`);
          } catch (err) {
            console.error(`Failed to delete old file: ${oldPath}`, err);
          }
        }
      }
    };

    deleteOldIfNew(files.picture_10?.[0], existing.picture_10);
    deleteOldIfNew(files.picture_23?.[0], existing.picture_23);
    deleteOldIfNew(files.threed_model_left?.[0], existing.threed_model_left);
    deleteOldIfNew(files.picture_17?.[0], existing.picture_17);
    deleteOldIfNew(files.picture_11?.[0], existing.picture_11);
    deleteOldIfNew(files.picture_24?.[0], existing.picture_24);
    deleteOldIfNew(files.threed_model_right?.[0], existing.threed_model_right);
    deleteOldIfNew(files.picture_16?.[0], existing.picture_16);

    const picture_10 = files.picture_10?.[0]?.filename || existing.picture_10;
    const picture_23 = files.picture_23?.[0]?.filename || existing.picture_23;
    const threed_model_left =
      files.threed_model_left?.[0]?.filename || existing.threed_model_left;
    const picture_17 = files.picture_17?.[0]?.filename || existing.picture_17;
    const picture_11 = files.picture_11?.[0]?.filename || existing.picture_11;
    const picture_24 = files.picture_24?.[0]?.filename || existing.picture_24;
    const threed_model_right =
      files.threed_model_right?.[0]?.filename || existing.threed_model_right;
    const picture_16 = files.picture_16?.[0]?.filename || existing.picture_16;

    let csvData: any = {};
    if (files.csvFile && files.csvFile[0]) {
      const csvPath = files.csvFile[0].path;
      csvData = await parseCSV(csvPath);
      fs.unlinkSync(csvPath);
    }

    const updateData = {
      vorname: vorname || existing.vorname,
      nachname: nachname || existing.nachname,
      email: email || existing.email,
      telefonnummer: telefonnummer || existing.telefonnummer,
      wohnort: wohnort || existing.wohnort,

      ausfuhrliche_diagnose:
        ausfuhrliche_diagnose || existing.ausfuhrliche_diagnose,

      picture_10,
      picture_23,
      threed_model_left,
      picture_17,
      picture_11,
      picture_24,
      threed_model_right,
      picture_16,

      fusslange1: csvData.B58 || fusslange1 || existing.fusslange1,
      fusslange2: csvData.C58 || fusslange2 || existing.fusslange2,
      fussbreite1: csvData.B73 || fussbreite1 || existing.fussbreite1,
      fussbreite2: csvData.C73 || fussbreite2 || existing.fussbreite2,
      kugelumfang1: csvData.B102 || kugelumfang1 || existing.kugelumfang1,
      kugelumfang2: csvData.C102 || kugelumfang2 || existing.kugelumfang2,
      rist1: csvData.B105 || rist1 || existing.rist1,
      rist2: csvData.C105 || rist2 || existing.rist2,
      archIndex1: csvData.B120 || archIndex1 || existing.archIndex1,
      archIndex2: csvData.C120 || archIndex2 || existing.archIndex2,
      zehentyp1: csvData.B136 || zehentyp1 || existing.zehentyp1,
      zehentyp2: csvData.C136 || zehentyp2 || existing.zehentyp2,

      updatedBy: req.user.id,
    };

    const updatedCustomer = await prisma.customers.update({
      where: { id },
      data: updateData,
      include: { versorgungen: true },
    });

    const customerWithImages = {
      ...updatedCustomer,
      picture_10: updatedCustomer?.picture_10
        ? getImageUrl(`/uploads/${updatedCustomer.picture_10}`)
        : null,
      picture_23: updatedCustomer?.picture_23
        ? getImageUrl(`/uploads/${updatedCustomer.picture_23}`)
        : null,
      picture_11: updatedCustomer?.picture_11
        ? getImageUrl(`/uploads/${updatedCustomer.picture_11}`)
        : null,
      picture_24: updatedCustomer?.picture_24
        ? getImageUrl(`/uploads/${updatedCustomer.picture_24}`)
        : null,
      threed_model_left: updatedCustomer?.threed_model_left
        ? getImageUrl(`/uploads/${updatedCustomer.threed_model_left}`)
        : null,
      threed_model_right: updatedCustomer?.threed_model_right
        ? getImageUrl(`/uploads/${updatedCustomer.threed_model_right}`)
        : null,
    };

    res.status(200).json({
      success: true,
      message: "Customer updated successfully",
      data: customerWithImages,
    });
  } catch (err: any) {
    console.error("Update Customer Error:", err);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: err.message,
    });
  }
};

export const getCustomerById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const customer = await prisma.customers.findUnique({
      where: { id },
      include: { versorgungen: true },
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }
    const customerWithImages = {
      ...customer,
      picture_10: customer.picture_10
        ? getImageUrl(`/uploads/${customer.picture_10}`)
        : null,
      picture_23: customer.picture_23
        ? getImageUrl(`/uploads/${customer.picture_23}`)
        : null,
      picture_11: customer.picture_11
        ? getImageUrl(`/uploads/${customer.picture_11}`)
        : null,
      picture_24: customer.picture_24
        ? getImageUrl(`/uploads/${customer.picture_24}`)
        : null,
      threed_model_left: customer.threed_model_left
        ? getImageUrl(`/uploads/${customer.threed_model_left}`)
        : null,
      threed_model_right: customer.threed_model_right
        ? getImageUrl(`/uploads/${customer.threed_model_right}`)
        : null,
    };
    res.status(200).json({
      success: true,
      message: "Customer fetched successfully",
      data: customerWithImages,
    });
  } catch (error: any) {
    console.error("Get Customer By ID Error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// export const assignVersorgungToCustomer = async (
//   req: Request,
//   res: Response
// ) => {
//   try {
//     const { customerId, versorgungenId } = req.params;

//     // 1. Check if customer exists
//     const customer = await prisma.customers.findUnique({
//       where: { id: customerId },
//       include: { versorgungen: true },
//     });
//     if (!customer) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Customer not found" });
//     }

//     // 2. Get Versorgungen data
//     const versorgung = await prisma.versorgungen.findUnique({
//       where: { id: versorgungenId },
//     });
//     if (!versorgung) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Versorgung not found" });
//     }

//     // 3. Check if this customer already has a versorgung with the same status
//     const existing = await prisma.customer_versorgungen.findFirst({
//       where: { customerId: customerId, status: versorgung.status },
//     });

//     let result;

//     if (existing) {
//       // 4. Replace existing record with new versorgung data
//       result = await prisma.customer_versorgungen.update({
//         where: { id: existing.id },
//         data: {
//           name: versorgung.name,
//           rohlingHersteller: versorgung.rohlingHersteller,
//           artikelHersteller: versorgung.artikelHersteller,
//           versorgung: versorgung.versorgung,
//           material: versorgung.material,
//           langenempfehlung: versorgung.langenempfehlung,
//           status: versorgung.status,
//         },
//       });
//     } else {
//       // 5. Create new if not exists for this status
//       result = await prisma.customer_versorgungen.create({
//         data: {
//           name: versorgung.name,
//           rohlingHersteller: versorgung.rohlingHersteller,
//           artikelHersteller: versorgung.artikelHersteller,
//           versorgung: versorgung.versorgung,
//           material: versorgung.material,
//           langenempfehlung: versorgung.langenempfehlung,
//           status: versorgung.status,
//           customerId: customer.id,
//         },
//       });
//     }

//     res.status(201).json({
//       success: true,
//       message: existing
//         ? "Versorgung replaced successfully for this status"
//         : "Versorgung assigned to customer successfully",
//       data: result,
//     });
//   } catch (error: any) {
//     console.error("Assign Versorgung Error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Something went wrong",
//       error: error.message,
//     });
//   }
// };

export const assignVersorgungToCustomer = async (
  req: Request,
  res: Response
) => {
  try {
    const { customerId, versorgungenId } = req.params;

    const [customer, versorgung] = await Promise.all([
      prisma.customers.findUnique({ where: { id: customerId } }),
      prisma.versorgungen.findUnique({ where: { id: versorgungenId } }),
    ]);

    if (!customer)
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    if (!versorgung)
      return res
        .status(404)
        .json({ success: false, message: "Versorgung not found" });

    await prisma.customer_versorgungen.upsert({
      where: {
        id:
          (
            await prisma.customer_versorgungen.findFirst({
              where: { customerId, status: versorgung.status },
              select: { id: true },
            })
          )?.id || "00000000-0000-0000-0000-000000000000",
      },
      create: {
        name: versorgung.name,
        rohlingHersteller: versorgung.rohlingHersteller,
        artikelHersteller: versorgung.artikelHersteller,
        versorgung: versorgung.versorgung,
        material: versorgung.material,
        langenempfehlung: versorgung.langenempfehlung,
        status: versorgung.status,
        customerId,
      },
      update: {
        name: versorgung.name,
        rohlingHersteller: versorgung.rohlingHersteller,
        artikelHersteller: versorgung.artikelHersteller,
        versorgung: versorgung.versorgung,
        material: versorgung.material,
        langenempfehlung: versorgung.langenempfehlung,
        status: versorgung.status,
      },
    });

    // Fetch customer with relations in one query
    const updatedCustomer = await prisma.customers.findUnique({
      where: { id: customerId },
      include: { versorgungen: true },
    });

    // Format image URLs once
    const formattedCustomer = {
      ...updatedCustomer,
      picture_10: updatedCustomer?.picture_10
        ? getImageUrl(`/uploads/${updatedCustomer.picture_10}`)
        : null,
      picture_23: updatedCustomer?.picture_23
        ? getImageUrl(`/uploads/${updatedCustomer.picture_23}`)
        : null,
      picture_11: updatedCustomer?.picture_11
        ? getImageUrl(`/uploads/${updatedCustomer.picture_11}`)
        : null,
      picture_24: updatedCustomer?.picture_24
        ? getImageUrl(`/uploads/${updatedCustomer.picture_24}`)
        : null,
      threed_model_left: updatedCustomer?.threed_model_left
        ? getImageUrl(`/uploads/${updatedCustomer.threed_model_left}`)
        : null,
      threed_model_right: updatedCustomer?.threed_model_right
        ? getImageUrl(`/uploads/${updatedCustomer.threed_model_right}`)
        : null,
    };

    res.status(200).json({
      success: true,
      message: "Versorgung assigned/replaced successfully",
      data: formattedCustomer,
    });
  } catch (error: any) {
    console.error("Assign Versorgung Error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

export const undoAssignVersorgungToCustomer = async (
  req: Request,
  res: Response
) => {
  try {
    const { customerId, versorgungenId } = req.params;

    // ✅ Find assignment in customer_versorgungen
    const existing = await prisma.customer_versorgungen.findFirst({
      where: {
        customerId,
        // Match original versorgungen data
        name:
          (
            await prisma.versorgungen.findUnique({
              where: { id: versorgungenId },
            })
          )?.name || "",
      },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Assigned Versorgung not found for this customer",
      });
    }

    // ✅ Delete assignment
    await prisma.customer_versorgungen.delete({ where: { id: existing.id } });

    // ✅ Fetch updated customer with all assigned versorgungen
    const updatedCustomer = await prisma.customers.findUnique({
      where: { id: customerId },
      include: { versorgungen: true },
    });

    const customerWithImages = {
      ...updatedCustomer,
      picture_10: updatedCustomer?.picture_10
        ? getImageUrl(`/uploads/${updatedCustomer.picture_10}`)
        : null,
      picture_23: updatedCustomer?.picture_23
        ? getImageUrl(`/uploads/${updatedCustomer.picture_23}`)
        : null,
      picture_11: updatedCustomer?.picture_11
        ? getImageUrl(`/uploads/${updatedCustomer.picture_11}`)
        : null,
      picture_24: updatedCustomer?.picture_24
        ? getImageUrl(`/uploads/${updatedCustomer.picture_24}`)
        : null,
      threed_model_left: updatedCustomer?.threed_model_left
        ? getImageUrl(`/uploads/${updatedCustomer.threed_model_left}`)
        : null,
      threed_model_right: updatedCustomer?.threed_model_right
        ? getImageUrl(`/uploads/${updatedCustomer.threed_model_right}`)
        : null,
    };

    res.status(200).json({
      success: true,
      message: "Versorgung assignment undone successfully",
      data: customerWithImages,
    });
  } catch (error: any) {
    console.error("Undo Assign Versorgung Error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};
