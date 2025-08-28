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
    const { customerId, versorgungId } = req.body;
    const partnerId = req.user.id;

    // Basic input validation
    if (!customerId || !versorgungId) {
      return res.status(400).json({
        success: false,
        message: "Customer ID and Versorgung ID are required",
      });
    }

    // Fetch customer & versorgung in parallel
    const [customer, versorgung] = await Promise.all([
      prisma.customers.findUnique({
        where: { id: customerId },
        select: {
          id: true,
          vorname: true,
          nachname: true,
          fußanalyse: true,
          einlagenversorgung: true,
        },
      }),
      prisma.versorgungen.findUnique({
        where: { id: versorgungId },
      }),
    ]);

    if (!customer) {
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    }
    if (!versorgung) {
      return res
        .status(404)
        .json({ success: false, message: "Versorgung not found" });
    }

    if (customer.fußanalyse == null || customer.einlagenversorgung == null) {
      return res.status(400).json({
        success: false,
        message:
          "fußanalyse or einlagenversorgung price is not set for this customer",
      });
    }

    const totalPrice = customer.fußanalyse + customer.einlagenversorgung;

    const order = await prisma.$transaction(async (tx) => {
      const customerProduct = await tx.customerProduct.create({
        data: {
          name: versorgung.name,
          rohlingHersteller: versorgung.rohlingHersteller,
          artikelHersteller: versorgung.artikelHersteller,
          versorgung: versorgung.versorgung,
          material: versorgung.material,
          langenempfehlung: versorgung.langenempfehlung,
          status: versorgung.status,
          diagnosis_status: versorgung.diagnosis_status,
        },
      });

      const newOrder = await tx.customerOrders.create({
        data: {
          customerId,
          partnerId,
          fußanalyse: customer.fußanalyse,
          einlagenversorgung: customer.einlagenversorgung,
          totalPrice,
          productId: customerProduct.id,
          statusUpdate: new Date(),
        },
        include: {
          product: true,
        },
      });

      await tx.customerHistorie.create({
        data: {
          customerId,
          category: "Bestellungen",
          eventId: newOrder.id,
          note: "New order created",
          system_note: "New order created",
          paymentIs: totalPrice.toString(),
        },
      });

      return newOrder;
    });

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: order,
    });
  } catch (error: any) {
    console.error("Create Order Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (req.query.customerId) {
      where.customerId = req.query.customerId as string;
    }

    if (req.query.partnerId) {
      where.partnnerId = req.query.partnerId as string;
    }

    if (req.query.orderStatus) {
      where.orderStatus = req.query.orderStatus as string;
    }

    const [orders, totalCount] = await Promise.all([
      prisma.customerOrders.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          fußanalyse: true,
          einlagenversorgung: true,
          orderStatus: true,
          statusUpdate: true,
          createdAt: true,
          updatedAt: true,
          customer: {
            select: {
              id: true,
              vorname: true,
              nachname: true,
              email: true,
              telefonnummer: true,
              wohnort: true,
              customerNumber: true,
            },
          },
          //   partner: {
          //     select: {
          //       id: true,
          //       name: true,
          //       email: true,
          //     },
          //   },
          //   product: {
          //     select: {
          //       id: true,
          //       name: true,
          //       status: true,
          //       diagnosis_status: true,
          //     },
          //   },
          product: true,
        },
      }),
      prisma.customerOrders.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      data: orders,
      pagination: {
        totalItems: totalCount,
        totalPages,
        currentPage: page,
        itemsPerPage: limit,
        hasNextPage,
        hasPrevPage,
      },
    });
  } catch (error: any) {
    console.error("Get All Orders Error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const order = await prisma.customerOrders.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            customerNumber: true,
            vorname: true,
            nachname: true,
            email: true,
            telefonnummer: true,
            wohnort: true,
          },
        },
        product: true,
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order fetched successfully",
      data: order,
    });
  } catch (error: any) {
    console.error("Get Order By ID Error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};
