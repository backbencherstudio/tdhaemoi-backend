import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/* VERY IMPORTANT ALSO SHOW CUSTOMER FOR WHICH ONE IN THE HISTORY WE USED THE SIZE FOR4. 🧾 Inventory Movement History (Stock Log)Each product has its own history log showing every stock change:Incoming (e.g. deliveries)Outgoing (e.g. sales, reservations)Corrections (manual adjustments)Transfers (between storage locations)Each entry should include:Date & timeQuantity change (+X or –X)New stock levelUser or system actionOptional: Comment or reason

*/

/*
model Stores {
  id             String @id @default(uuid()) // Unique identifier for each store item
  produktname    String // Product name
  hersteller     String // Manufacturer
  artikelnummer  String // Article number / SKU
  lagerort       String // Storage location / warehouse location
  mindestbestand Int // Minimum stock level

  groessenMengen Json // Sizes & quantities (e.g., {"S": 10, "M": 20, "L": 15})
  purchase_price Int // Purchase price
  selling_price  Int // Selling price
  Status         String // Status (e.g., "In Stock", "Out of Stock", "Discontinued")

  versorgungen Versorgungen[]

  userId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  storesHistory StoresHistory[] // History of stock changes

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([id, produktname])
  @@map("stores")
}

model StoresHistory {
  id      String @id @default(uuid())
  storeId String
  store   Stores @relation(fields: [storeId], references: [id], onDelete: Cascade)

  changeType ChangeType
  quantity   Int
  newStock   Int
  reason     String?

  userId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  customerId String? // Optional: Link to customer if applicable
  customer   customers? @relation(fields: [customerId], references: [id], onDelete: SetNull)

  orderId String? // Optional: Link to order if applicable
  order   customerOrders? @relation(fields: [orderId], references: [id], onDelete: SetNull)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([storeId])
  @@index([userId])
  @@index([createdAt])
  @@index([customerId])
  @@index([orderId])
  @@map("storeshistory")
}

enum ChangeType {
  INCOMING // e.g., deliveries
  OUTGOING // e.g., sales, reservations
  CORRECTION // manual adjustments
  TRANSFER // between storage locations 
}


*/

export const createStorage = async (req: Request, res: Response) => {
  try {
    const {
      produktname,
      hersteller,
      artikelnummer,
      lagerort,
      mindestbestand,
      groessenMengen,
      purchase_price,
      selling_price,
      Status,
    } = req.body;

    const userId = req.user.id;
    console.log(userId);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const missingField = [
      "produktname",
      "hersteller",
      "artikelnummer",
      "lagerort",
      "mindestbestand",
      "groessenMengen",
      "purchase_price",
      "selling_price",
      "Status",
    ].find((field) => !req.body[field]);

    if (missingField) {
      res.status(400).json({
        message: `${missingField} is required!`,
      });
      return;
    }

    const newStorage = await prisma.stores.create({
      data: {
        produktname,
        hersteller,
        artikelnummer,
        lagerort,
        mindestbestand,
        groessenMengen,
        purchase_price,
        selling_price,
        Status,
        userId,
      },
    });

    res.status(201).json({
      success: true,
      message: "Storage created successfully",
      data: newStorage,
    });
  } catch (error) {
    console.error("error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getAllMyStorage = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    console.log(userId);

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const totalItems = await prisma.stores.count({
      where: { userId },
    });

    const allStorage = await prisma.stores.findMany({
      where: { userId },
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(totalItems / limit);

    res.status(200).json({
      success: true,
      message: "All storage fetched successfully",
      data: allStorage,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getSingleStorage = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const storeId = req.params.id;

    const totalItems = await prisma.stores.count({
      where: { userId },
    });

    const data = await prisma.stores.findFirst({
      where: { userId, id: storeId },
    });

    res.status(200).json({
      success: true,
      message: "storage fetched successfully",
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};


export const updateStorage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const updatedStorageData = Object.fromEntries(
      Object.entries(req.body).filter(([_, value]) => value !== undefined)
    );

    const updatedStorage = await prisma.stores.update({
      where: { id },
      data: updatedStorageData,
    });

    res.status(200).json({
      success: true,
      message: "Storage updated successfully",
      data: updatedStorage,
    });
  } catch (error: any) {
    console.error("updateStorage error:", error);

    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Storage not found",
      });
    }

    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const deleteStorage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deletedStorage = await prisma.stores.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: "Storage deleted successfully",
    });
  } catch (error: any) {
    if (error.code === "P2025") {
      res.status(404).json({
        success: false,
        message: "Storage not found",
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
