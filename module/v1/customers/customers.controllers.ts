import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import iconv from "iconv-lite";
import csvParser from "csv-parser";

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

    res.status(201).json({
      success: true,
      message: "Customer created successfully",
      data: customer,
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
