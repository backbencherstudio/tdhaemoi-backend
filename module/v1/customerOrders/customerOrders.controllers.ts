import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import iconv from "iconv-lite";
import csvParser from "csv-parser";
import { getImageUrl } from "../../../utils/base_utl";
import path from "path";

const prisma = new PrismaClient();



// model customerOrders {
//   id String @id @default(uuid())

//   customerId String?
//   customer   customers? @relation(fields: [customerId], references: [id], onDelete: SetNull)

//   partnnerId String?
//   partner    User?   @relation(fields: [partnnerId], references: [id], onDelete: SetNull, name: "PartnerOrders")

//   fußanalyse        Float?
//   einlagenversorgung Float?
//   totalPrice         Float

//   product   customerProduct? @relation(fields: [productId], references: [id])
//   productId String?          @unique

//   orderStatus  OrderStatus @default(Einlage_vorbereiten)
//   statusUpdate DateTime?

//   createdAt DateTime @default(now())
//   updatedAt DateTime @updatedAt

//   @@index([customerId])
//   @@index([partnnerId])
//   @@index([createdAt])
//   @@index([totalPrice])
//   @@index([customerId, partnnerId])
//   @@index([customerId, createdAt])
// }

// model customerProduct {
//   id                String @id @default(uuid())
//   name              String
//   rohlingHersteller String
//   artikelHersteller String
//   versorgung        String
//   material          String
//   langenempfehlung  Json

//   status           versorgungenStatus
//   diagnosis_status versorgungenDiagnosisStatus?

//   order customerOrders? @relation

//   createdAt DateTime @default(now())
//   updatedAt DateTime @updatedAt

//   @@index([name])
//   @@index([status])
//   @@index([diagnosis_status])
//   @@index([rohlingHersteller])
//   @@index([artikelHersteller])
//   @@index([createdAt])
//   @@index([status, diagnosis_status])
// }

// enum OrderStatus {
//   Einlage_vorbereiten
//   Einlage_in_Fertigung
//   Einlage_verpacken
//   Einlage_Abholbereit
//   Einlage_versandt
//   Ausgeführte_Einlagen
// }


export const createOrder = async (req: Request, res: Response) => {
  try {

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};
