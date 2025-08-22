import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import iconv from "iconv-lite";
import csvParser from "csv-parser";
import { getImageUrl } from "../../../utils/base_utl";
import path from "path";

const prisma = new PrismaClient();

const targetCells = [
  "B58", // fusslange1
  "C58", // fusslange2
  "B73", // fussbreite1
  "C73", // fussbreite2
  "B102", // kugelumfang1
  "C102", // kugelumfang2
  "B105", // rist1
  "C105", // rist2
  "B136", // zehentyp1
  "C136", // zehentyp2
  "B120", // archIndex1
  "C120", // archIndex2
];

async function parseCSV(csvPath: string): Promise<any> {
  return new Promise((resolve, reject) => {
    console.log("Parsing CSV file:", csvPath);
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
            results[cell] = row[colIndex] || null;
          }
        });
      })
      .on("end", () => resolve(results))
      .on("error", (err) => reject(err));
  });
}


export const createCustomers = async (req: Request, res: Response) => {
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
    const missingField = ["vorname", "nachname", "email"].find(
      (field) => !req.body[field]
    );
    if (missingField) {
      return res.status(400).json({
        success: false,
        message: `${missingField} is required!`,
      });
    }

    const {
      vorname,
      nachname,
      email,
      telefonnummer,
      wohnort,
      ausfuhrliche_diagnose,
      kundeSteuernummer,
      diagnose,
      kodexeMassschuhe,
      kodexeEinlagen,
      sonstiges,
    } = req.body;

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

    let csvData: any = {};
    let csvFileName: string | null = null;
    if (files.csvFile && files.csvFile[0]) {
      const csvPath = files.csvFile[0].path;
      csvFileName = files.csvFile[0].filename;
      console.log("Parsing CSV file:", csvPath);
      csvData = await parseCSV(csvPath);
    }

    const customer = await prisma.$transaction(async (tx) => {
      const newCustomer = await tx.customers.create({
        data: {
          vorname,
          nachname,
          email,
          telefonnummer: telefonnummer || null,
          wohnort: wohnort || null,
          ausfuhrliche_diagnose: ausfuhrliche_diagnose || null,
          kundeSteuernummer: kundeSteuernummer || null,
          diagnose: diagnose || null,
          kodexeMassschuhe: kodexeMassschuhe || null,
          kodexeEinlagen: kodexeEinlagen || null,
          sonstiges: sonstiges || null,
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

      if (
        files.picture_10 ||
        files.picture_23 ||
        files.threed_model_left ||
        files.picture_17 ||
        files.picture_11 ||
        files.picture_24 ||
        files.threed_model_right ||
        files.picture_16 ||
        csvFileName
      ) {
        await tx.screener_file.create({
          data: {
            customerId: newCustomer.id,
            picture_10: files.picture_10?.[0]?.filename || null,
            picture_23: files.picture_23?.[0]?.filename || null,
            threed_model_left: files.threed_model_left?.[0]?.filename || null,
            picture_17: files.picture_17?.[0]?.filename || null,
            picture_11: files.picture_11?.[0]?.filename || null,
            picture_24: files.picture_24?.[0]?.filename || null,
            threed_model_right: files.threed_model_right?.[0]?.filename || null,
            picture_16: files.picture_16?.[0]?.filename || null,
            csvFile: csvFileName,
          },
        });
      }

      // await tx.customerHistorie.create({
      //   data: {
      //     customerId: newCustomer.id,
      //     category: "Notizen",
      //     note: `Customer ${vorname} ${nachname} created by user ${req.user.id}`,
      //     createdAt: new Date(),
      //     updatedAt: new Date(),
      //   },
      // });

      return newCustomer;
    });

    if (csvFileName && files.csvFile?.[0]?.path) {
      try {
        fs.unlinkSync(files.csvFile[0].path);
      } catch (err) {
        console.error(
          `Failed to delete CSV file ${files.csvFile[0].path}`,
          err
        );
      }
    }

    const customerWithScreener = await prisma.customers.findUnique({
      where: { id: customer.id },
      include: { screenerFile: true },
    });

    // Simplified response formatting to ensure screenerFile is an array
    const customerWithImages = {
      ...customerWithScreener,
      screenerFile: (customerWithScreener?.screenerFile || []).map(
        (screener) => ({
          id: screener.id,
          customerId: screener.customerId,
          picture_10: screener.picture_10
            ? getImageUrl(`/uploads/${screener.picture_10}`)
            : null,
          picture_23: screener.picture_23
            ? getImageUrl(`/uploads/${screener.picture_23}`)
            : null,
          picture_11: screener.picture_11
            ? getImageUrl(`/uploads/${screener.picture_11}`)
            : null,
          picture_24: screener.picture_24
            ? getImageUrl(`/uploads/${screener.picture_24}`)
            : null,
          threed_model_left: screener.threed_model_left
            ? getImageUrl(`/uploads/${screener.threed_model_left}`)
            : null,
          threed_model_right: screener.threed_model_right
            ? getImageUrl(`/uploads/${screener.threed_model_right}`)
            : null,
          picture_17: screener.picture_17
            ? getImageUrl(`/uploads/${screener.picture_17}`)
            : null,
          picture_16: screener.picture_16
            ? getImageUrl(`/uploads/${screener.picture_16}`)
            : null,
          csvFile: screener.csvFile
            ? getImageUrl(`/uploads/${screener.csvFile}`)
            : null,
          createdAt: screener.createdAt,
          updatedAt: screener.updatedAt,
        })
      ),
    };

    res.status(201).json({
      success: true,
      message: "Customer created successfully",
      data: customerWithImages,
    });
  } catch (err: any) {
    console.error("Create Customer Error:", err);
    cleanupFiles();
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

    const whereCondition: any = {};
    if (search) {
      whereCondition.OR = [
        { vorname: { contains: search, mode: "insensitive" } },
        { nachname: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const [customers, totalCount] = await Promise.all([
      prisma.customers.findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          versorgungen: true,
          screenerFile: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      }),
      prisma.customers.count({ where: whereCondition }),
    ]);

    const customersWithImages = customers.map((c) => ({
      ...c,
      screenerFile: c.screenerFile.map((screener) => ({
        id: screener.id,
        customerId: screener.customerId,
        picture_10: screener.picture_10
          ? getImageUrl(`/uploads/${screener.picture_10}`)
          : null,
        picture_23: screener.picture_23
          ? getImageUrl(`/uploads/${screener.picture_23}`)
          : null,
        picture_11: screener.picture_11
          ? getImageUrl(`/uploads/${screener.picture_11}`)
          : null,
        picture_24: screener.picture_24
          ? getImageUrl(`/uploads/${screener.picture_24}`)
          : null,
        threed_model_left: screener.threed_model_left
          ? getImageUrl(`/uploads/${screener.threed_model_left}`)
          : null,
        threed_model_right: screener.threed_model_right
          ? getImageUrl(`/uploads/${screener.threed_model_right}`)
          : null,
        picture_17: screener.picture_17
          ? getImageUrl(`/uploads/${screener.picture_17}`)
          : null,
        picture_16: screener.picture_16
          ? getImageUrl(`/uploads/${screener.picture_16}`)
          : null,
        csvFile: screener.csvFile
          ? getImageUrl(`/uploads/${screener.csvFile}`)
          : null,
        createdAt: screener.createdAt,
        updatedAt: screener.updatedAt,
      })),
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
  } finally {
    await prisma.$disconnect();
  }
};

export const deleteCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const customer = await prisma.customers.findUnique({
      where: { id },
      include: {
        screenerFile: true,
        einlagenAnswers: true,
        versorgungen: true,
      },
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    customer.screenerFile.forEach((screener) => {
      const fileFields = [
        screener.picture_10,
        screener.picture_23,
        screener.picture_17,
        screener.picture_11,
        screener.picture_24,
        screener.picture_16,
        screener.threed_model_left,
        screener.threed_model_right,
        screener.csvFile,
      ];
      fileFields.forEach((file) => {
        if (file) {
          const filePath = `uploads/${file}`;
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
      });
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
      kundeSteuernummer,
      diagnose,
      kodexeMassschuhe,
      kodexeEinlagen,
      sonstiges,
    } = req.body;

    const updateData = {
      vorname: vorname || existing.vorname,
      nachname: nachname || existing.nachname,
      email: email || existing.email,
      telefonnummer: telefonnummer || existing.telefonnummer,
      wohnort: wohnort || existing.wohnort,
      ausfuhrliche_diagnose:
        ausfuhrliche_diagnose || existing.ausfuhrliche_diagnose,
      kundeSteuernummer: kundeSteuernummer || existing.kundeSteuernummer,
      diagnose: diagnose || existing.diagnose,
      kodexeMassschuhe: kodexeMassschuhe || existing.kodexeMassschuhe,
      kodexeEinlagen: kodexeEinlagen || existing.kodexeEinlagen,
      sonstiges: sonstiges || existing.sonstiges,

      fusslange1: fusslange1 || existing.fusslange1,
      fusslange2: fusslange2 || existing.fusslange2,
      fussbreite1: fussbreite1 || existing.fussbreite1,
      fussbreite2: fussbreite2 || existing.fussbreite2,
      kugelumfang1: kugelumfang1 || existing.kugelumfang1,
      kugelumfang2: kugelumfang2 || existing.kugelumfang2,
      rist1: rist1 || existing.rist1,
      rist2: rist2 || existing.rist2,
      zehentyp1: zehentyp1 || existing.zehentyp1,
      zehentyp2: zehentyp2 || existing.zehentyp2,
      archIndex1: archIndex1 || existing.archIndex1,
      archIndex2: archIndex2 || existing.archIndex2,
      updatedBy: req.user.id,
    };

    const updatedCustomer = await prisma.customers.update({
      where: { id },
      data: updateData,
      include: { versorgungen: true },
    });

    res.status(200).json({
      success: true,
      message: "Customer updated successfully",
      data: updatedCustomer,
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

export const updateCustomerSpecialFields = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const {
      kundeSteuernummer,
      diagnose,
      kodexeMassschuhe,
      kodexeEinlagen,
      sonstiges,
    } = req.body;
    const existing = await prisma.customers.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }
    const updateData = {
      kundeSteuernummer: kundeSteuernummer || existing.kundeSteuernummer,
      diagnose: diagnose || existing.diagnose,
      kodexeMassschuhe: kodexeMassschuhe || existing.kodexeMassschuhe,
      kodexeEinlagen: kodexeEinlagen || existing.kodexeEinlagen,
      sonstiges: sonstiges || existing.sonstiges,
      updatedBy: req.user.id,
    };
    const updatedCustomer = await prisma.customers.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        kundeSteuernummer: true,
        diagnose: true,
        kodexeMassschuhe: true,
        kodexeEinlagen: true,
        sonstiges: true,
        updatedBy: true,
      },
    });
    res.status(200).json({
      success: true,
      message: "Customer special fields updated successfully",
      data: updatedCustomer,
    });
  } catch (err: any) {
    console.error("Update Customer Special Fields Error:", err);
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
      where: { id: id },
      include: {
        versorgungen: true,
        einlagenAnswers: {
          orderBy: [{ category: "asc" }, { questionId: "asc" }],
        },
        screenerFile: true,
      },
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const einlagenAnswersByCategory = customer.einlagenAnswers.reduce(
      (acc, answer) => {
        if (!acc[answer.category]) {
          acc[answer.category] = {
            category: answer.category,
            answers: [],
          };
        }

        const formattedAnswer = {
          questionId: parseInt(answer.questionId),
          selected: answer.answer,
        };
        acc[answer.category].answers.push(formattedAnswer);
        return acc;
      },
      {} as Record<string, any>
    );

    const screenerFilesWithImages = customer.screenerFile
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ) // Sort by createdAt (latest first)
      .map((screener) => ({
        id: screener.id,
        customerId: screener.customerId,
        picture_10: screener.picture_10
          ? getImageUrl(`/uploads/${screener.picture_10}`)
          : null,
        picture_23: screener.picture_23
          ? getImageUrl(`/uploads/${screener.picture_23}`)
          : null,
        picture_11: screener.picture_11
          ? getImageUrl(`/uploads/${screener.picture_11}`)
          : null,
        picture_24: screener.picture_24
          ? getImageUrl(`/uploads/${screener.picture_24}`)
          : null,
        threed_model_left: screener.threed_model_left
          ? getImageUrl(`/uploads/${screener.threed_model_left}`)
          : null,
        threed_model_right: screener.threed_model_right
          ? getImageUrl(`/uploads/${screener.threed_model_right}`)
          : null,
        picture_17: screener.picture_17
          ? getImageUrl(`/uploads/${screener.picture_17}`)
          : null,
        picture_16: screener.picture_16
          ? getImageUrl(`/uploads/${screener.picture_16}`)
          : null,
        csvFile: screener.csvFile
          ? getImageUrl(`/uploads/${screener.csvFile}`)
          : null,
        createdAt: screener.createdAt,
        updatedAt: screener.updatedAt,
      }));

    const customerWithImages = {
      ...customer,
      einlagenAnswers: Object.values(einlagenAnswersByCategory),
      screenerFile: screenerFilesWithImages,
    };

    res.status(200).json({
      success: true,
      message: "Customer fetched successfully",
      data: [customerWithImages],
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
    // Find existing record first
    const existingRecord = await prisma.customer_versorgungen.findFirst({
      where: {
        customerId,
        status: versorgung.status,
        diagnosis_status: versorgung.diagnosis_status,
      },
    });
    const versorgungData = {
      name: versorgung.name,
      rohlingHersteller: versorgung.rohlingHersteller,
      artikelHersteller: versorgung.artikelHersteller,
      versorgung: versorgung.versorgung,
      material: versorgung.material,
      langenempfehlung: versorgung.langenempfehlung,
      status: versorgung.status,
      diagnosis_status: versorgung.diagnosis_status,
    };
    if (existingRecord) {
      await prisma.customer_versorgungen.update({
        where: { id: existingRecord.id },
        data: versorgungData,
      });
    } else {
      await prisma.customer_versorgungen.create({
        data: {
          ...versorgungData,
          customerId,
        },
      });
    }
    const updatedCustomer = await prisma.customers.findUnique({
      where: { id: customerId },
      include: {
        versorgungen: true,
        screenerFile: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });
    const latestScreener = updatedCustomer?.screenerFile[0] || null;
    const screenerData = latestScreener
      ? {
          id: latestScreener.id,
          customerId: latestScreener.customerId,
          picture_10: latestScreener.picture_10
            ? getImageUrl(`/uploads/${latestScreener.picture_10}`)
            : null,
          picture_23: latestScreener.picture_23
            ? getImageUrl(`/uploads/${latestScreener.picture_23}`)
            : null,
          picture_11: latestScreener.picture_11
            ? getImageUrl(`/uploads/${latestScreener.picture_11}`)
            : null,
          picture_24: latestScreener.picture_24
            ? getImageUrl(`/uploads/${latestScreener.picture_24}`)
            : null,
          threed_model_left: latestScreener.threed_model_left
            ? getImageUrl(`/uploads/${latestScreener.threed_model_left}`)
            : null,
          threed_model_right: latestScreener.threed_model_right
            ? getImageUrl(`/uploads/${latestScreener.threed_model_right}`)
            : null,
          picture_17: latestScreener.picture_17
            ? getImageUrl(`/uploads/${latestScreener.picture_17}`)
            : null,
          picture_16: latestScreener.picture_16
            ? getImageUrl(`/uploads/${latestScreener.picture_16}`)
            : null,
          csvFile: latestScreener.csvFile
            ? getImageUrl(`/uploads/${latestScreener.csvFile}`)
            : null,
          createdAt: latestScreener.createdAt,
          updatedAt: latestScreener.updatedAt,
        }
      : null;

    const formattedCustomer = {
      ...updatedCustomer,
      screenerFile: screenerData ? [screenerData] : [],
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

    const existing = await prisma.customer_versorgungen.findFirst({
      where: {
        customerId,
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

    await prisma.customer_versorgungen.delete({ where: { id: existing.id } });

    const updatedCustomer = await prisma.customers.findUnique({
      where: { id: customerId },
      include: {
        versorgungen: true,
        screenerFile: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    const latestScreener = updatedCustomer?.screenerFile[0] || null;
    const screenerData = latestScreener
      ? {
          id: latestScreener.id,
          customerId: latestScreener.customerId,
          picture_10: latestScreener.picture_10
            ? getImageUrl(`/uploads/${latestScreener.picture_10}`)
            : null,
          picture_23: latestScreener.picture_23
            ? getImageUrl(`/uploads/${latestScreener.picture_23}`)
            : null,
          picture_11: latestScreener.picture_11
            ? getImageUrl(`/uploads/${latestScreener.picture_11}`)
            : null,
          picture_24: latestScreener.picture_24
            ? getImageUrl(`/uploads/${latestScreener.picture_24}`)
            : null,
          threed_model_left: latestScreener.threed_model_left
            ? getImageUrl(`/uploads/${latestScreener.threed_model_left}`)
            : null,
          threed_model_right: latestScreener.threed_model_right
            ? getImageUrl(`/uploads/${latestScreener.threed_model_right}`)
            : null,
          picture_17: latestScreener.picture_17
            ? getImageUrl(`/uploads/${latestScreener.picture_17}`)
            : null,
          picture_16: latestScreener.picture_16
            ? getImageUrl(`/uploads/${latestScreener.picture_16}`)
            : null,
          csvFile: latestScreener.csvFile
            ? getImageUrl(`/uploads/${latestScreener.csvFile}`)
            : null,
          createdAt: latestScreener.createdAt,
          updatedAt: latestScreener.updatedAt,
        }
      : null;

    const formattedCustomer = {
      ...updatedCustomer,
      screenerFile: screenerData ? [screenerData] : [],
    };

    res.status(200).json({
      success: true,
      message: "Versorgung assignment undone successfully",
      data: formattedCustomer,
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

// export const searchCustomers = async (req: Request, res: Response) => {
//   try {
//     const { search, email, phone, location, id, name, limit = 10 } = req.query;

//     // Build dynamic where conditions
//     const whereConditions: any[] = [];

//     // General search across name fields (first name and last name)
//     if (name && typeof name === 'string' && name.trim()) {
//       const nameQuery = name.trim();
//       whereConditions.push({
//         OR: [
//           {
//             vorname: {
//               contains: nameQuery,
//               mode: "insensitive",
//             },
//           },
//           {
//             nachname: {
//               contains: nameQuery,
//               mode: "insensitive",
//             },
//           },
//         ],
//       });
//     }

//     // General search across name fields
//     if (search && typeof search === 'string' && search.trim()) {
//       const searchQuery = search.trim();
//       whereConditions.push({
//         OR: [
//           {
//             vorname: {
//               contains: searchQuery,
//               mode: "insensitive",
//             },
//           },
//           {
//             nachname: {
//               contains: searchQuery,
//               mode: "insensitive",
//             },
//           },
//         ],
//       });
//     }

//     // Specific email search
//     if (email && typeof email === 'string' && email.trim()) {
//       whereConditions.push({
//         email: {
//           contains: email.trim(),
//           mode: "insensitive",
//         },
//       });
//     }

//     // Specific phone search
//     if (phone && typeof phone === 'string' && phone.trim()) {
//       whereConditions.push({
//         telefonnummer: {
//           contains: phone.trim(),
//           mode: "insensitive",
//         },
//       });
//     }

//     // Specific location search
//     if (location && typeof location === 'string' && location.trim()) {
//       whereConditions.push({
//         wohnort: {
//           contains: location.trim(),
//           mode: "insensitive",
//         },
//       });
//     }

//     // Specific customer ID search
//     if (id && typeof id === 'string' && id.trim()) {
//       whereConditions.push({
//         id: {
//           equals: id.trim(),
//         },
//       });
//     }

//     // If no search criteria provided, return empty results
//     if (whereConditions.length === 0) {
//       return res.status(200).json({
//         success: true,
//         message: "No search criteria provided",
//         data: {
//           totalResults: 0,
//           suggestions: [],
//         },
//       });
//     }

//     const limitNumber = Math.min(parseInt(limit as string) || 10, 50);

//     const customers = await prisma.customers.findMany({
//       where: {
//         AND: whereConditions,
//       },
//       select: {
//         id: true,
//         vorname: true,
//         nachname: true,
//         email: true,
//         telefonnummer: true,
//         wohnort: true,
//         createdAt: true,
//       },
//       take: limitNumber,
//       orderBy: [
//         { vorname: "asc" },
//         { nachname: "asc" },
//       ],
//     });

//     const suggestions = customers.map((customer) => ({
//       id: customer.id,
//       name: `${customer.vorname} ${customer.nachname}`,
//       email: customer.email,
//       phone: customer.telefonnummer,
//       location: customer.wohnort,
//       fullName: `${customer.vorname} ${customer.nachname}`,
//       createdAt: customer.createdAt,
//     }));

//     res.status(200).json({
//       success: true,
//       message: "Customer search results",
//       data: suggestions,
//     });
//   } catch (error: any) {
//     console.error("Search Customers Error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Something went wrong",
//       error: error.message,
//     });
//   }
// };

export const searchCustomers = async (req: Request, res: Response) => {
  try {
    const {
      search,
      email,
      phone,
      location,
      id,
      name,
      limit = 10,
      page = 1,
    } = req.query;
    const limitNumber = Math.min(
      Math.max(parseInt(limit as string) || 10, 1),
      100
    );
    const pageNumber = Math.max(parseInt(page as string) || 1, 1);
    const skip = (pageNumber - 1) * limitNumber;
    if (!search && !email && !phone && !location && !id && !name) {
      return res.status(200).json({
        success: true,
        message: "No search criteria provided",
        data: {
          totalResults: 0,
          totalPages: 0,
          currentPage: pageNumber,
          customers: [],
        },
      });
    }
    const whereConditions: any = {};
    if (name && typeof name === "string") {
      const nameQuery = name.trim();
      if (nameQuery) {
        const nameParts = nameQuery.split(/\s+/).filter(Boolean);
        if (nameParts.length > 1) {
          whereConditions.AND = [
            { vorname: { contains: nameParts[0], mode: "insensitive" } },
            {
              nachname: {
                contains: nameParts.slice(1).join(" "),
                mode: "insensitive",
              },
            },
          ];
        } else {
          whereConditions.OR = [
            { vorname: { contains: nameQuery, mode: "insensitive" } },
            { nachname: { contains: nameQuery, mode: "insensitive" } },
          ];
        }
      }
    }
    if (search && typeof search === "string") {
      const searchQuery = search.trim();
      if (searchQuery) {
        whereConditions.OR = [
          { vorname: { contains: searchQuery, mode: "insensitive" } },
          { nachname: { contains: searchQuery, mode: "insensitive" } },
          { email: { contains: searchQuery, mode: "insensitive" } },
          { telefonnummer: { contains: searchQuery, mode: "insensitive" } },
          { wohnort: { contains: searchQuery, mode: "insensitive" } },
        ];
      }
    }
    if (email && typeof email === "string" && email.trim() && !search) {
      whereConditions.email = { contains: email.trim(), mode: "insensitive" };
    }
    if (phone && typeof phone === "string" && phone.trim() && !search) {
      whereConditions.telefonnummer = {
        contains: phone.trim(),
        mode: "insensitive",
      };
    }
    if (
      location &&
      typeof location === "string" &&
      location.trim() &&
      !search
    ) {
      whereConditions.wohnort = {
        contains: location.trim(),
        mode: "insensitive",
      };
    }
    if (id && typeof id === "string" && id.trim()) {
      whereConditions.id = id.trim();
    }
    const [total, customers] = await prisma.$transaction([
      prisma.customers.count({ where: whereConditions }),
      prisma.customers.findMany({
        where: whereConditions,
        select: {
          id: true,
          vorname: true,
          nachname: true,
          email: true,
          telefonnummer: true,
          wohnort: true,
          createdAt: true,
        },
        take: limitNumber,
        skip,
        orderBy: [{ vorname: "asc" }, { nachname: "asc" }],
      }),
    ]);

    const response = {
      success: true,
      message: "Customer search results",
      data: customers.map((customer) => ({
        id: customer.id,
        name: `${customer.vorname} ${customer.nachname}`,
        email: customer.email,
        phone: customer.telefonnummer,
        location: customer.wohnort,
        createdAt: customer.createdAt,
      })),
    };
    res.status(200).json(response);
  } catch (error: any) {
    console.error("Search Customers Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const addScreenerFile = async (req: Request, res: Response) => {
  const { customerId } = req.params;
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

    let csvFileName: string | null = null;
    let csvData: any = {};
    if (files.csvFile && files.csvFile[0]) {
      const csvPath = files.csvFile[0].path;
      csvFileName = files.csvFile[0].filename;
      console.log("Parsing CSV file:", csvPath);
      csvData = await parseCSV(csvPath);
    }

    if (Object.keys(csvData).length > 0) {
      await prisma.customers.update({
        where: { id: customerId },
        data: {
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
          updatedBy: req.user.id,
          updatedAt: new Date(),
        },
      });
    }

    const newScreener = await prisma.screener_file.create({
      data: {
        customerId,
        picture_10: files.picture_10?.[0]?.filename || null,
        picture_23: files.picture_23?.[0]?.filename || null,
        threed_model_left: files.threed_model_left?.[0]?.filename || null,
        picture_17: files.picture_17?.[0]?.filename || null,
        picture_11: files.picture_11?.[0]?.filename || null,
        picture_24: files.picture_24?.[0]?.filename || null,
        threed_model_right: files.threed_model_right?.[0]?.filename || null,
        picture_16: files.picture_16?.[0]?.filename || null,
        csvFile: csvFileName,
      },
    });

    const formattedScreener = {
      id: newScreener.id,
      customerId: newScreener.customerId,
      picture_10: newScreener.picture_10
        ? getImageUrl(`/uploads/${newScreener.picture_10}`)
        : null,
      picture_23: newScreener.picture_23
        ? getImageUrl(`/uploads/${newScreener.picture_23}`)
        : null,
      picture_11: newScreener.picture_11
        ? getImageUrl(`/uploads/${newScreener.picture_11}`)
        : null,
      picture_24: newScreener.picture_24
        ? getImageUrl(`/uploads/${newScreener.picture_24}`)
        : null,
      threed_model_left: newScreener.threed_model_left
        ? getImageUrl(`/uploads/${newScreener.threed_model_left}`)
        : null,
      threed_model_right: newScreener.threed_model_right
        ? getImageUrl(`/uploads/${newScreener.threed_model_right}`)
        : null,
      picture_17: newScreener.picture_17
        ? getImageUrl(`/uploads/${newScreener.picture_17}`)
        : null,
      picture_16: newScreener.picture_16
        ? getImageUrl(`/uploads/${newScreener.picture_16}`)
        : null,
      csvFile: newScreener.csvFile
        ? getImageUrl(`/uploads/${newScreener.csvFile}`)
        : null,
      createdAt: newScreener.createdAt,
      updatedAt: newScreener.updatedAt,
    };

    if (csvFileName && files.csvFile?.[0]?.path) {
      try {
        fs.unlinkSync(files.csvFile[0].path);
      } catch (err) {
        console.error(
          `Failed to delete CSV file ${files.csvFile[0].path}`,
          err
        );
      }
    }

    res.status(201).json({
      success: true,
      message: "New screener file set added successfully",
      data: formattedScreener,
    });
  } catch (error: any) {
    console.error("Add Screener File Error:", error);
    cleanupFiles();
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  } finally {
    await prisma.$disconnect();
  }
};

export const updateScreenerFile = async (req: Request, res: Response) => {
  const { customerId, screenerId } = req.params;
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
    const customer = await prisma.customers.findUnique({
      where: { id: customerId },
      select: {
        id: true,
        fusslange1: true,
        fusslange2: true,
        fussbreite1: true,
        fussbreite2: true,
        kugelumfang1: true,
        kugelumfang2: true,
        rist1: true,
        rist2: true,
        archIndex1: true,
        archIndex2: true,
        zehentyp1: true,
        zehentyp2: true,
      },
    });

    if (!customer) {
      cleanupFiles();
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const existingScreener = await prisma.screener_file.findUnique({
      where: {
        id: screenerId,
      },
    });

    if (!existingScreener || existingScreener.customerId !== customerId) {
      cleanupFiles();
      return res.status(404).json({
        success: false,
        message: "Screener file not found for this customer",
      });
    }

    const latestScreener = await prisma.screener_file.findFirst({
      where: { customerId },
      orderBy: { createdAt: "desc" },
      take: 1,
      select: { id: true },
    });
    console.log("latestScreener:", latestScreener);

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

    const updateData: any = {};
    let csvData: any = {};
    let csvFileName: string | null = existingScreener.csvFile;

    if (files?.picture_10?.[0]) {
      deleteOldIfNew(files.picture_10[0], existingScreener.picture_10);
      updateData.picture_10 = files.picture_10[0].filename;
    }

    if (files?.picture_23?.[0]) {
      deleteOldIfNew(files.picture_23[0], existingScreener.picture_23);
      updateData.picture_23 = files.picture_23[0].filename;
    }

    if (files?.threed_model_left?.[0]) {
      deleteOldIfNew(
        files.threed_model_left[0],
        existingScreener.threed_model_left
      );
      updateData.threed_model_left = files.threed_model_left[0].filename;
    }

    if (files?.picture_17?.[0]) {
      deleteOldIfNew(files.picture_17[0], existingScreener.picture_17);
      updateData.picture_17 = files.picture_17[0].filename;
    }

    if (files?.picture_11?.[0]) {
      deleteOldIfNew(files.picture_11[0], existingScreener.picture_11);
      updateData.picture_11 = files.picture_11[0].filename;
    }

    if (files?.picture_24?.[0]) {
      deleteOldIfNew(files.picture_24[0], existingScreener.picture_24);
      updateData.picture_24 = files.picture_24[0].filename;
    }

    if (files?.threed_model_right?.[0]) {
      deleteOldIfNew(
        files.threed_model_right[0],
        existingScreener.threed_model_right
      );
      updateData.threed_model_right = files.threed_model_right[0].filename;
    }

    if (files?.picture_16?.[0]) {
      deleteOldIfNew(files.picture_16[0], existingScreener.picture_16);
      updateData.picture_16 = files.picture_16[0].filename;
    }

    if (files?.csvFile?.[0]) {
      deleteOldIfNew(files.csvFile[0], existingScreener.csvFile);
      const csvPath = files.csvFile[0].path;
      csvFileName = files.csvFile[0].filename;
      csvData = await parseCSV(csvPath);
      updateData.csvFile = csvFileName;
    }

    if (Object.keys(csvData).length > 0 && latestScreener?.id === screenerId) {
      await prisma.customers.update({
        where: { id: customerId },
        data: {
          fusslange1: csvData.B58 ?? customer.fusslange1,
          fusslange2: csvData.C58 ?? customer.fusslange2,
          fussbreite1: csvData.B73 ?? customer.fussbreite1,
          fussbreite2: csvData.C73 ?? customer.fussbreite2,
          kugelumfang1: csvData.B102 ?? customer.kugelumfang1,
          kugelumfang2: csvData.C102 ?? customer.kugelumfang2,
          rist1: csvData.B105 ?? customer.rist1,
          rist2: csvData.C105 ?? customer.rist2,
          archIndex1: csvData.B120 ?? customer.archIndex1,
          archIndex2: csvData.C120 ?? customer.archIndex2,
          zehentyp1: csvData.B136 ?? customer.zehentyp1,
          zehentyp2: csvData.C136 ?? customer.zehentyp2,
          updatedBy: req.user.id,
          updatedAt: new Date(),
        },
      });
    }

    // Update the screener file record only if there are changes
    const updatedScreener = await prisma.screener_file.update({
      where: { id: screenerId },
      data: updateData,
    });

    // Format the response with image URLs
    const formatFileUrl = (filename: string | null) =>
      filename ? getImageUrl(`/uploads/${filename}`) : null;

    const formattedScreener = {
      id: updatedScreener.id,
      customerId: updatedScreener.customerId,
      picture_10: formatFileUrl(updatedScreener.picture_10),
      picture_23: formatFileUrl(updatedScreener.picture_23),
      picture_11: formatFileUrl(updatedScreener.picture_11),
      picture_24: formatFileUrl(updatedScreener.picture_24),
      threed_model_left: formatFileUrl(updatedScreener.threed_model_left),
      threed_model_right: formatFileUrl(updatedScreener.threed_model_right),
      picture_17: formatFileUrl(updatedScreener.picture_17),
      picture_16: formatFileUrl(updatedScreener.picture_16),
      csvFile: formatFileUrl(updatedScreener.csvFile),
      createdAt: updatedScreener.createdAt,
      updatedAt: updatedScreener.updatedAt,
    };

    res.status(200).json({
      success: true,
      message: "Screener file updated successfully",
      data: formattedScreener,
    });
  } catch (error: any) {
    console.error("Update Screener File Error:", error);
    cleanupFiles();
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

export const deleteScreenerFile = async (req: Request, res: Response) => {
  const { screenerId } = req.params;

  try {
    const screenerFile = await prisma.screener_file.findUnique({
      where: { id: screenerId },
    });

    if (!screenerFile) {
      return res.status(404).json({
        success: false,
        message: "Screener file not found",
      });
    }

    const fileFields = [
      screenerFile.picture_10,
      screenerFile.picture_23,
      screenerFile.picture_17,
      screenerFile.picture_11,
      screenerFile.picture_24,
      screenerFile.picture_16,
      screenerFile.threed_model_left,
      screenerFile.threed_model_right,
      screenerFile.csvFile,
    ];

    fileFields.forEach((file) => {
      if (file) {
        const filePath = path.join(process.cwd(), "uploads", file);
        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
            console.log(`Deleted file: ${filePath}`);
          } catch (err) {
            console.error(`Failed to delete file: ${filePath}`, err);
          }
        }
      }
    });

    await prisma.screener_file.delete({
      where: { id: screenerId },
    });

    res.status(200).json({
      success: true,
      message: "Screener file deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete Screener File Error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};
