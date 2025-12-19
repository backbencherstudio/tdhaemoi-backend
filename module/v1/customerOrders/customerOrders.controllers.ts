// @ts-nocheck
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import iconv from "iconv-lite";
import csvParser from "csv-parser";
import { getImageUrl } from "../../../utils/base_utl";
import path from "path";
import {
  sendPdfToEmail,
  sendInvoiceEmail,
} from "../../../utils/emailService.utils";

const prisma = new PrismaClient();

const extractLengthValue = (value: any): number | null => {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "object" && !Array.isArray(value)) {
    if (Object.prototype.hasOwnProperty.call(value, "length")) {
      const lengthNumber = Number((value as any).length);
      return Number.isFinite(lengthNumber) ? lengthNumber : null;
    }
  }

  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
};

const determineSizeFromGroessenMengen = (
  groessenMengen: any,
  targetLength: number
): string | null => {
  if (!groessenMengen || typeof groessenMengen !== "object") {
    return null;
  }

  let closestSizeKey: string | null = null;
  let smallestDiff = Infinity;

  for (const [sizeKey, sizeData] of Object.entries(
    groessenMengen as Record<string, any>
  )) {
    const lengthValue = extractLengthValue(sizeData);
    if (lengthValue === null) {
      continue;
    }
    const diff = Math.abs(targetLength - lengthValue);
    if (diff < smallestDiff) {
      smallestDiff = diff;
      closestSizeKey = sizeKey;
    }
  }

  return closestSizeKey;
};

//-------------------------
// Compute larger fuss length (+5) and match nearest size from langenempfehlung

//  "groessenMengen": {
//     "35": {
//         "length": 225,
//         "quantity": 5
//     },
//     "36": {
//         "length": 230,
//         "quantity": 2
//     },
//     "37": {
//         "length": 235,
//         "quantity": 1
//     },
//     "38": {
//         "length": 240,
//         "quantity": 5
//     },
//   }
// we need to just update this quantity, i need to less one

//----------------------------

// einlagentyp         String?
// überzug            String?
// menge               Int? //quantity
// versorgung_note     String? //Hast du sonstige Anmerkungen oder Notizen zur Versorgung... ?
// schuhmodell_wählen String? //জুতার মডেল নির্বাচন করুন ম্যানুয়ালি লিখুন (ব্র্যান্ড + মডেল + সাইজ)
// kostenvoranschlag   Boolean? @default(false)

const serializeMaterial = (material: any): string => {
  if (Array.isArray(material)) {
    return material
      .map((item) => (item == null ? "" : String(item).trim()))
      .filter((item) => item.length > 0)
      .join(", ");
  }

  if (typeof material === "string") {
    return material;
  }

  return material !== undefined && material !== null ? String(material) : "";
};

const deserializeMaterial = (material: any): string[] | null => {
  if (Array.isArray(material)) {
    return material;
  }

  if (typeof material === "string") {
    const items = material
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
    return items.length ? items : null;
  }

  return null;
};

// Get next order number for a partner (starts from 1000)
const getNextOrderNumberForPartner = async (
  tx: any,
  partnerId: string
): Promise<number> => {
  const maxOrder = await tx.customerOrders.findFirst({
    where: { partnerId },
    orderBy: { orderNumber: "desc" },
    select: { orderNumber: true },
  });
  return maxOrder ? maxOrder.orderNumber + 1 : 1000;
};

// Helper to get quantity from size data (handles both old and new formats)
const getQuantity = (sizeData: any): number => {
  if (sizeData && typeof sizeData === "object" && "quantity" in sizeData) {
    return Number(sizeData.quantity ?? 0);
  }
  return typeof sizeData === "number" ? sizeData : 0;
};

// Helper to update size data with new quantity
const updateSizeQuantity = (sizeData: any, newQty: number): any => {
  if (sizeData && typeof sizeData === "object" && "quantity" in sizeData) {
    return { ...sizeData, quantity: newQty };
  }
  return typeof sizeData === "number" ? newQty : { quantity: newQty };
};

export const createOrder = async (req: Request, res: Response) => {
  try {
    const {
      customerId,
      versorgungId,

      einlagentyp,
      überzug,
      menge,
      versorgung_note,
      schuhmodell_wählen,
      kostenvoranschlag,
      ausführliche_diagnose,
      versorgung_laut_arzt,
      // Inline order payload fields
      kundenName,
      auftragsDatum,
      wohnort,
      telefon,
      email: werkstattEmail,
      geschaeftsstandort,
      mitarbeiter,
      fertigstellungBis,
      versorgung: werkstattVersorgung,
      bezahlt,
      fussanalysePreis,
      einlagenversorgungPreis,
      werkstattEmployeeId,
    } = req.body;
    const partnerId = req.user.id;

    console.log(bezahlt);

    // console.log(customerId, versorgungId, partnerId);

    if (!customerId || !versorgungId) {
      return res.status(400).json({
        success: false,
        message: "Customer ID and Versorgung ID are required",
      });
    }

    if (!bezahlt) {
      return res.status(400).json({
        success: false,
        message: "Payment status (bezahlt) is required",
      });
    }
    const validPaymentStatuses = new Set([
      "Privat_Bezahlt",
      "Privat_offen",
      "Krankenkasse_Ungenehmigt",
      "Krankenkasse_Genehmigt",
    ]);

    if (!validPaymentStatuses.has(bezahlt)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment status",
        validStatuses: Array.from(validPaymentStatuses),
      });
    }

    const [customer, versorgung] = await Promise.all([
      prisma.customers.findUnique({
        where: { id: customerId },
        select: {
          fusslange1: true,
          fusslange2: true,
        },
      }),
      prisma.versorgungen.findUnique({
        where: { id: versorgungId },
        select: {
          id: true,
          name: true,
          rohlingHersteller: true,
          artikelHersteller: true,
          versorgung: true,
          material: true,
          diagnosis_status: true,
          storeId: true,
          supplyStatus: {
            select: {
              id: true,
              price: true,
              name: true,
            },
          },
        },
      }),
    ]);

    console.log("============================", versorgung?.storeId);
    if (!customer || !versorgung) {
      return res
        .status(404)
        .json({ success: false, message: "Customer or Versorgung not found" });
    }

    if (!versorgung.supplyStatus || versorgung.supplyStatus.price == null) {
      return res.status(400).json({
        success: false,
        message:
          "Supply status price is not set for this versorgung. Please assign a supply status with a price.",
      });
    }

    // Get price from supplyStatus instead of customer
    const totalPrice = versorgung.supplyStatus.price;

    if (customer.fusslange1 == null || customer.fusslange2 == null) {
      return res.status(400).json({
        success: false,
        message: "Customer fusslange1 or fusslange2 not found",
      });
    }

    const largerFusslange = Math.max(
      Number(customer.fusslange1) + 5,
      Number(customer.fusslange2) + 5
    );

    let matchedSizeKey: string | null = determineProductSize(
      customer,
      versorgung
    );

    const order = await prisma.$transaction(async (tx) => {
      const customerProduct = await tx.customerProduct.create({
        data: {
          name: versorgung.name,
          rohlingHersteller: versorgung.rohlingHersteller,
          artikelHersteller: versorgung.artikelHersteller,
          versorgung: versorgung.versorgung,
          material: serializeMaterial(versorgung.material),
          langenempfehlung: {}, // langenempfehlung not available in Versorgungen model
          status: "Alltagseinlagen", // Default status since it's not in Versorgungen model
          diagnosis_status: versorgung.diagnosis_status,
        },
      });

      const orderNumber = await getNextOrderNumberForPartner(tx, partnerId);

      const newOrder: any = await tx.customerOrders.create({
        data: {
          customerId,
          partnerId,
          orderNumber,
          versorgungId: versorgungId,
          fußanalyse: null, // Price now comes from supplyStatus
          einlagenversorgung: null, // Price now comes from supplyStatus
          totalPrice,
          productId: customerProduct.id,
          statusUpdate: new Date(),
          ausführliche_diagnose,
          versorgung_laut_arzt,
          einlagentyp,
          überzug,
          menge,
          versorgung_note,
          schuhmodell_wählen,
          kostenvoranschlag,
          storeId: versorgung?.storeId ?? null,
          // bezahlt: werkstattBezahlt ?? null,
          bezahlt: bezahlt ?? null,
          kundenName: kundenName ?? null,
          auftragsDatum: auftragsDatum ? new Date(auftragsDatum) : null,
          wohnort: wohnort ?? null,
          telefon: telefon ?? null,
          email: werkstattEmail ?? null,
          geschaeftsstandort: geschaeftsstandort ?? null,
          mitarbeiter: mitarbeiter ?? null,
          fertigstellungBis: fertigstellungBis
            ? new Date(fertigstellungBis)
            : null,
          versorgung: werkstattVersorgung ?? null,
          fussanalysePreis: fussanalysePreis ?? undefined,
          einlagenversorgungPreis: einlagenversorgungPreis ?? undefined,
          werkstattEmployeeId: werkstattEmployeeId ?? null,
        } as any,
        select: {
          id: true,
          werkstattEmployeeId: true,
        } as any,
      });

      // Update store stock if needed
      if (versorgung.storeId) {
        const store = await tx.stores.findUnique({
          where: { id: versorgung.storeId },
          select: { id: true, groessenMengen: true, userId: true },
        });

        if (store?.groessenMengen && typeof store.groessenMengen === "object") {
          const sizes = { ...(store.groessenMengen as any) } as Record<
            string,
            any
          >;
          const targetLength =
            Math.max(Number(customer.fusslange1), Number(customer.fusslange2)) +
            5;
          const storeMatchedSizeKey = determineSizeFromGroessenMengen(
            sizes,
            targetLength
          );

          if (!storeMatchedSizeKey) throw new Error("NO_MATCHED_SIZE_IN_STORE");

          const sizeValue = sizes[storeMatchedSizeKey];
          const currentQty = getQuantity(sizeValue);
          const newQty = Math.max(currentQty - 1, 0);

          sizes[storeMatchedSizeKey] = updateSizeQuantity(sizeValue, newQty);

          await tx.stores.update({
            where: { id: store.id },
            data: { groessenMengen: sizes },
          });

          await tx.storesHistory.create({
            data: {
              storeId: store.id,
              changeType: "sales",
              quantity: currentQty > 0 ? 1 : 0,
              newStock: newQty,
              reason: `Order size ${storeMatchedSizeKey}`,

              partnerId: store.userId,
              customerId,
              orderId: newOrder.id,
              status: "SELL_OUT",
            },
          });

          matchedSizeKey = storeMatchedSizeKey;
        }
      }

      await tx.customerHistorie.create({
        data: {
          customerId,
          category: "Bestellungen",
          eventId: newOrder.id,
          // set hear order id
          note: `Einlagenauftrag ${newOrder.id} erstellt`,
          system_note: "New order created",
          paymentIs: totalPrice.toString(),
        } as any,
      });
      await tx.customerOrdersHistory.create({
        data: {
          orderId: newOrder.id,
          statusFrom: "Warten_auf_Versorgungsstart",
          statusTo: "Warten_auf_Versorgungsstart",
          partnerId: partnerId,
          employeeId: newOrder.werkstattEmployeeId || null,
          note: null,
        } as any,
      });

      return { ...newOrder, matchedSizeKey } as any;
    });

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      orderId: order.id,
      matchedSize: order.matchedSizeKey,
    });
  } catch (error: any) {
    if (error?.message === "NO_MATCHED_SIZE_IN_STORE") {
      return res.status(400).json({
        success: false,
        message:
          "Unable to determine nearest size from groessenMengen for this store",
      });
    }
    console.error("Create Order Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error?.message,
    });
  }
};

// Helper Functions
const fetchCustomerData = async (customerId: string) => {
  return prisma.customers.findUnique({
    where: { id: customerId },
    select: {
      fusslange1: true,
      fusslange2: true,
    },
  });
};

const fetchVersorgungData = async (versorgungId: string) => {
  return prisma.versorgungen.findUnique({
    where: { id: versorgungId },
    select: {
      id: true,
      name: true,
      rohlingHersteller: true,
      artikelHersteller: true,
      versorgung: true,
      material: true,
      diagnosis_status: true,
      storeId: true,
      supplyStatus: {
        select: {
          id: true,
          price: true,
          name: true,
        },
      },
    },
  });
};

const validateData = (customer: any, versorgung: any) => {
  if (!customer || !versorgung) {
    return {
      success: false,
      message: "Customer or Versorgung not found",
      status: 404,
    };
  }

  if (!versorgung.supplyStatus || versorgung.supplyStatus.price == null) {
    return {
      success: false,
      message:
        "Supply status price is not set for this versorgung. Please assign a supply status with a price.",
      status: 400,
    };
  }

  if (customer.fusslange1 == null || customer.fusslange2 == null) {
    return {
      success: false,
      message: "Customer fusslange1 or fusslange2 not found",
      status: 400,
    };
  }

  return null;
};

const calculateTotalPrice = (versorgung: any): number =>
  versorgung?.supplyStatus?.price || 0;

const determineProductSize = (
  customer: any,
  versorgung: any
): string | null => {
  // langenempfehlung is not available in Versorgungen model
  // Size determination should be done using store groessenMengen instead
  return null;
};

const createOrderTransaction = async (
  tx: any,
  params: {
    customerId: string;
    partnerId: string;
    customer: any;
    versorgung: any;
    totalPrice: number;
    matchedSizeKey: string;
  }
) => {
  const {
    customerId,
    partnerId,
    customer,
    versorgung,
    totalPrice,
    matchedSizeKey,
  } = params;

  const customerProduct = await tx.customerProduct.create({
    data: {
      name: versorgung.name,
      rohlingHersteller: versorgung.rohlingHersteller,
      artikelHersteller: versorgung.artikelHersteller,
      versorgung: versorgung.versorgung,
      material: serializeMaterial(versorgung.material),
      langenempfehlung: {},
      status: "Alltagseinlagen",
      diagnosis_status: versorgung.diagnosis_status,
    },
  });

  const orderNumber = await getNextOrderNumberForPartner(tx, partnerId);

  const newOrder = await tx.customerOrders.create({
    data: {
      customerId,
      partnerId,
      orderNumber,
      versorgungId: versorgung.id,
      fußanalyse: null,
      einlagenversorgung: null,
      totalPrice,
      productId: customerProduct.id,
      statusUpdate: new Date(),
    },
    select: { id: true },
  });

  // Update store stock if store exists
  if (versorgung.storeId) {
    await updateStoreStock(tx, {
      storeId: versorgung.storeId,
      matchedSizeKey,
      customerId,
      orderId: newOrder.id,
    });
  }

  // Create customer history
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

  return { ...newOrder, matchedSizeKey };
};

const updateStoreStock = async (
  tx: any,
  params: {
    storeId: string;
    matchedSizeKey: string;
    customerId: string;
    orderId: string;
  }
) => {
  const { storeId, matchedSizeKey, customerId, orderId } = params;

  const store = await tx.stores.findUnique({
    where: { id: storeId },
    select: { id: true, groessenMengen: true, userId: true },
  });

  if (!store?.groessenMengen || typeof store.groessenMengen !== "object")
    return;

  const sizes = { ...(store.groessenMengen as any) };
  const sizeData = sizes[matchedSizeKey];
  if (!sizeData) return;

  const currentQty = getQuantity(sizeData);
  const currentLength = sizeData?.length ? Number(sizeData.length) : 0;
  const newQty = Math.max(currentQty - 1, 0);

  sizes[matchedSizeKey] = { quantity: newQty, length: currentLength };

  await tx.stores.update({
    where: { id: store.id },
    data: { groessenMengen: sizes },
  });

  await tx.storesHistory.create({
    data: {
      storeId: store.id,
      changeType: "sales",
      quantity: 1,
      newStock: newQty,
      reason: `Order size ${matchedSizeKey}`,
      partnerId: store.userId,
      customerId,
      orderId,
    },
  });
};

//---------------------------------------------------------
// Get all orders V1
//---------------------------------------------------------

export const getAllOrders_v1 = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const days = parseInt(req.query.days as string);
    const skip = (page - 1) * limit;

    const where: any = {};

    // Date filter
    if (days && !isNaN(days)) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      where.createdAt = {
        gte: startDate,
      };
    }

    // Customer filter
    if (req.query.customerId) {
      where.customerId = req.query.customerId as string;
    }

    // Partner filter
    if (req.query.partnerId) {
      where.partnerId = req.query.partnerId as string;
    }

    if (req.query.orderStatus) {
      const statuses = (req.query.orderStatus as string)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      if (statuses.length === 1) {
        where.orderStatus = statuses[0];
      } else if (statuses.length > 1) {
        where.orderStatus = { in: statuses };
      }
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
          totalPrice: true,
          orderStatus: true,
          statusUpdate: true,
          invoice: true,
          createdAt: true,
          updatedAt: true,
          customer: {
            select: {
              id: true,
              vorname: true,
              nachname: true,
              email: true,
              // telefonnummer: true,
              wohnort: true,
              customerNumber: true,
            },
          },
          product: true,
          auftragsDatum: true,
          fertigstellungBis: true,
          versorgung: true,
          bezahlt: true,
        },
      }),
      prisma.customerOrders.count({ where }),
    ]);

    const formattedOrders = orders.map((order) => ({
      ...order,
      invoice: order.invoice ? getImageUrl(`/uploads/${order.invoice}`) : null,
    }));

    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json({
      success: true,
      message: req.query.orderStatus
        ? `Orders with status: ${req.query.orderStatus}`
        : "All orders fetched successfully",
      data: formattedOrders,
      pagination: {
        totalItems: totalCount,
        totalPages,
        currentPage: page,
        itemsPerPage: limit,
        hasNextPage,
        hasPrevPage,
        filter: days ? `Last ${days} days` : "All time",
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

export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const days = parseInt(req.query.days as string);
    const skip = (page - 1) * limit;

    const partnerId = req.user?.id;
    const userRole = req.user?.role;

    const customerNumber = req.query.customerNumber as string;
    const orderNumber = req.query.orderNumber as string;
    const customerName = req.query.customerName as string;

    const where: any = {};

    if (days && !isNaN(days)) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      where.createdAt = {
        gte: startDate,
      };
    }

    if (req.query.customerId) {
      where.customerId = req.query.customerId as string;
    }

    if (userRole === "PARTNER") {
      where.partnerId = partnerId;
    } else if (req.query.partnerId) {
      where.partnerId = req.query.partnerId as string;
    }

    if (req.query.orderStatus) {
      const statuses = (req.query.orderStatus as string)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      if (statuses.length === 1) {
        where.orderStatus = statuses[0];
      } else if (statuses.length > 1) {
        where.orderStatus = { in: statuses };
      }
    }

    const searchConditions: any[] = [];

    if (customerNumber || orderNumber || customerName) {
      if (
        customerNumber &&
        customerNumber.trim() &&
        !isNaN(Number(customerNumber))
      ) {
        searchConditions.push({
          customer: {
            customerNumber: parseInt(customerNumber),
          },
        });
      }

      if (orderNumber && orderNumber.trim()) {
        const orderNum = parseInt(orderNumber);
        if (!isNaN(orderNum)) {
          searchConditions.push({
            orderNumber: orderNum,
          });
        }
      }

      if (customerName && customerName.trim()) {
        const nameTerms = customerName.trim().split(/\s+/).filter(Boolean);

        if (nameTerms.length === 1) {
          searchConditions.push({
            customer: {
              OR: [
                {
                  vorname: {
                    contains: nameTerms[0],
                    mode: "insensitive",
                  },
                },
                {
                  nachname: {
                    contains: nameTerms[0],
                    mode: "insensitive",
                  },
                },
              ],
            },
          });
        } else {
          searchConditions.push({
            customer: {
              AND: [
                {
                  vorname: {
                    contains: nameTerms[0],
                    mode: "insensitive",
                  },
                },
                {
                  nachname: {
                    contains: nameTerms.slice(1).join(" "),
                    mode: "insensitive",
                  },
                },
              ],
            },
          });
        }
      }

      if (searchConditions.length > 0) {
        if (searchConditions.length === 1) {
          Object.assign(where, searchConditions[0]);
        } else {
          where.AND = searchConditions;
        }
      }
    }

    const [orders, totalCount] = await Promise.all([
      prisma.customerOrders.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          orderNumber: true,
          fußanalyse: true,
          einlagenversorgung: true,
          totalPrice: true,
          orderStatus: true,
          statusUpdate: true,
          invoice: true,
          createdAt: true,
          updatedAt: true,
          priority: true,
          bezahlt: true,
          barcodeLabel: true,
          customer: {
            select: {
              id: true,
              vorname: true,
              nachname: true,
              email: true,
              wohnort: true,
              customerNumber: true,
            },
          },
          product: true,
          auftragsDatum: true,
          fertigstellungBis: true,
          versorgung: true,
          bezahlt: true,
        },
      }),
      prisma.customerOrders.count({ where }),
    ]);

    const formattedOrders = orders.map((order) => ({
      ...order,
      invoice: order.invoice ? getImageUrl(`/uploads/${order.invoice}`) : null,
      barcodeLabel: order.barcodeLabel
        ? getImageUrl(`/uploads/${order.barcodeLabel}`)
        : null,
    }));

    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    let message = "All orders fetched successfully";
    const filters = [];

    if (req.query.orderStatus) {
      filters.push(`status: ${req.query.orderStatus}`);
    }
    if (customerNumber) {
      filters.push(`customer number: ${customerNumber}`);
    }
    if (orderNumber) {
      filters.push(`order number: ${orderNumber}`);
    }
    if (customerName) {
      filters.push(`customer name: "${customerName}"`);
    }

    if (filters.length > 0) {
      message = `Orders with ${filters.join(", ")}`;
    }

    res.status(200).json({
      success: true,
      message,
      data: formattedOrders,
      pagination: {
        totalItems: totalCount,
        totalPages,
        currentPage: page,
        itemsPerPage: limit,
        hasNextPage,
        hasPrevPage,
        filter: days ? `Last ${days} days` : "All time",
        search: {
          customerNumber: customerNumber || null,
          orderNumber: orderNumber || null,
          customerName: customerName || null,
        },
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

    const order = (await prisma.customerOrders.findUnique({
      where: { id },
      include: {
        Versorgungen: true,
        store: {
          select: {
            id: true,
            produktname: true,
            groessenMengen: true,
          },
        },
        customer: {
          select: {
            id: true,
            customerNumber: true,
            vorname: true,
            nachname: true,
            email: true,
            telefon: true,
            wohnort: true,
            geburtsdatum: true,
            gender: true,

            fusslange1: true,
            fusslange2: true,
            fussbreite1: true,
            fussbreite2: true,
            kugelumfang1: true,
            kugelumfang2: true,
            rist1: true,
            rist2: true,
            zehentyp1: true,
            zehentyp2: true,
            archIndex1: true,
            archIndex2: true,
            screenerFile: {
              orderBy: { updatedAt: "desc" },
              take: 1,
              select: {
                id: true,
                createdAt: true,
              },
            },
          },
        },
        partner: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
            phone: true,
            absenderEmail: true,
            bankName: true,
            bankNumber: true,
            busnessName: true,
            hauptstandort: true,
            workshopNote: {
              select: {
                id: true,
                employeeId: true,
                employeeName: true,
                completionDays: true,
                pickupLocation: true,
                sameAsBusiness: true,
                showCompanyLogo: true,
                autoShowAfterPrint: true,
                autoApplySupply: true,
              },
            },
          },
        },
        product: true,
      },
    })) as any;

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // পিডিএফ এর লাই লাগে এইডা

    const getLargerFusslange = (): number | null => {
      if (
        order.customer?.fusslange1 === null ||
        order.customer?.fusslange2 === null
      ) {
        return null;
      }

      const fusslange1 = Number(order.customer.fusslange1) + 5;
      const fusslange2 = Number(order.customer.fusslange2) + 5;

      return Math.max(fusslange1, fusslange2);
    };

    const findNearestStoreSize = (
      value: number | null
    ): { size: string | null; value: number | null } => {
      if (
        value === null ||
        !order.store?.groessenMengen ||
        typeof order.store.groessenMengen !== "object"
      ) {
        return { size: null, value: null };
      }

      let nearestSize: string | null = null;
      let nearestValue: number | null = null;
      let smallestDifference = Infinity;

      for (const [sizeKey, sizeData] of Object.entries(
        order.store.groessenMengen as Record<string, any>
      )) {
        const lengthValue = extractLengthValue(sizeData);
        if (lengthValue === null) {
          continue;
        }

        const difference = Math.abs(value - lengthValue);
        if (difference < smallestDifference) {
          smallestDifference = difference;
          nearestSize = sizeKey;
          nearestValue = lengthValue;
        }
      }

      return { size: nearestSize, value: nearestValue };
    };

    const findNearestProductSize = (
      value: number | null
    ): { size: string | null; value: number | null } => {
      if (value === null || !order.product?.langenempfehlung) {
        return { size: null, value: null };
      }

      const langenempfehlung = order.product.langenempfehlung as Record<
        string,
        any
      >;
      let nearestSize: string | null = null;
      let nearestValue: number | null = null;
      let smallestDifference = Infinity;

      for (const [size, sizeValue] of Object.entries(langenempfehlung)) {
        const numericValue = extractLengthValue(sizeValue);
        if (numericValue === null) {
          continue;
        }
        const difference = Math.abs(value - numericValue);

        if (difference < smallestDifference) {
          smallestDifference = difference;
          nearestSize = size;
          nearestValue = numericValue;
        }
      }

      return { size: nearestSize, value: nearestValue };
    };

    const largerFusslange = getLargerFusslange();

    const storeNearestSize = findNearestStoreSize(largerFusslange);
    const productNearestSize = findNearestProductSize(largerFusslange);
    const nearestSize =
      storeNearestSize.size !== null ? storeNearestSize : productNearestSize;
    console.log("============================", nearestSize);
    const formattedOrder = {
      ...order,
      invoice: order.invoice ? getImageUrl(`/uploads/${order.invoice}`) : null,
      customer: order.customer
        ? {
            ...order.customer,
            fusslange1: order.customer.fusslange1,
            fusslange2: order.customer.fusslange2,
            largerFusslange,
            recommendedSize: nearestSize,
          }
        : null,
      partner: order.partner
        ? {
            ...order.partner,
            image: order.partner.image
              ? getImageUrl(`/uploads/${order.partner.image}`)
              : null,
            hauptstandort: order.partner.workshopNote?.sameAsBusiness
              ? order.partner.hauptstandort[0]
              : null,
          }
        : null,
      product: order.product
        ? {
            ...order.product,
            material: deserializeMaterial(order.product.material),
          }
        : null,
      Versorgungen: order.Versorgungen
        ? {
            ...order.Versorgungen,
            material: deserializeMaterial(order.Versorgungen.material),
          }
        : null,
      store: order.store ?? null,
    };

    res.status(200).json({
      success: true,
      message: "Order fetched successfully",
      data: formattedOrder,
    });
  } catch (error) {
    console.error("Get Order By ID Error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

export const getOrdersByCustomerId = async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params;
    const userId = req.user.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const customer = await prisma.customers.findUnique({
      where: { id: customerId },
      select: { id: true },
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const [orders, totalCount] = await Promise.all([
      prisma.customerOrders.findMany({
        where: { customerId, partnerId: userId },

        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          Versorgungen: {
            select: {
              id: true,
              name: true,
              material: true,
            },
          },
          customer: {
            select: {
              id: true,
              vorname: true,
              nachname: true,
              email: true,
              telefon: true,
              wohnort: true,
              customerNumber: true,
            },
          },
          // partner: {
          //   select: {
          //     id: true,
          //     name: true,
          //     email: true,
          //     image: true,
          //   },
          // },
          product: true,
        },
      }),
      prisma.customerOrders.count({ where: { customerId, partnerId: userId } }),
    ]);

    const formattedOrders = orders.map((order) => ({
      ...order,
      invoice: order.invoice ? getImageUrl(`/uploads/${order.invoice}`) : null,
    }));

    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json({
      success: true,
      message: "Customer orders fetched successfully",
      data: formattedOrders,
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
    console.error("Get Orders By Customer ID Error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

export const updateMultiplePaymentStatus = async (
  req: Request,
  res: Response
) => {
  try {
    const { orderIds, bezahlt } = req.body;

    if (!orderIds) {
      return res.status(400).json({
        success: false,
        message: "Order IDs are required",
      });
    }

    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order IDs must be a non-empty array",
      });
    }
    if (!bezahlt) {
      return res.status(400).json({
        success: false,
        message: "Payment status is required",
      });
    }

    const validPaymentStatuses = new Set([
      "Privat_Bezahlt",
      "Privat_offen",
      "Krankenkasse_Ungenehmigt",
      "Krankenkasse_Genehmigt",
    ]);

    if (!validPaymentStatuses.has(bezahlt)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment status",
        error: `Payment status must be one of: ${Array.from(
          validPaymentStatuses
        ).join(", ")}`,
        validStatuses: Array.from(validPaymentStatuses),
      });
    }

    // First get all orders with their current status
    const orders = await prisma.customerOrders.findMany({
      where: {
        id: {
          in: orderIds,
        },
      },
      select: {
        id: true,
        bezahlt: true,
        orderStatus: true,
      },
    });

    // Update all orders
    const updateResult = await prisma.customerOrders.updateMany({
      where: {
        id: {
          in: orderIds,
        },
      },
      data: {
        bezahlt,
        statusUpdate: new Date(),
      },
    });

    // Create history for each order that changed
    for (const order of orders) {
      if (order.bezahlt !== bezahlt) {
        await prisma.customerOrdersHistory.create({
          data: {
            orderId: order.id,
            statusFrom: order.orderStatus,
            statusTo: order.orderStatus,
            paymentFrom: order.bezahlt,
            paymentTo: bezahlt,
            isPrementChange: true,
            partnerId: req.user?.id || null,
            employeeId: null, // add if you have employeeId in request
            note: `Payment status changed from "${order.bezahlt}" to "${bezahlt}"`,
          },
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Successfully updated ${updateResult.count} order(s) to payment status: ${bezahlt}`,
      updatedCount: updateResult.count,
      ids: orderIds,
      bezahlt,
    });
  } catch (error) {
    console.error("Update Multiple Order Statuses Error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong while updating order statuses",
      error: (error as any).message,
    });
  }
};

export const updateMultipleOrderStatuses = async (
  req: Request,
  res: Response
) => {
  try {
    const { orderIds, orderStatus } = req.body;

    // Validate required fields
    if (!orderIds || !orderStatus) {
      return res.status(400).json({
        success: false,
        message: "Order IDs and order status are required",
      });
    }

    // Validate orderIds is an array
    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order IDs must be a non-empty array",
      });
    }

    // Validate order status
    const validOrderStatuses = new Set([
      "Warten_auf_Versorgungsstart",
      "In_Fertigung",
      "Verpacken_Qualitätssicherung",
      "Abholbereit_Versandt",
      "Ausgeführt",
    ]);

    if (!validOrderStatuses.has(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
        error: `Order status must be one of: ${Array.from(
          validOrderStatuses
        ).join(", ")}`,
        validStatuses: Array.from(validOrderStatuses),
      });
    }

    // Check if all orders exist
    const existingOrders = await prisma.customerOrders.findMany({
      where: {
        id: {
          in: orderIds,
        },
      },
      select: {
        id: true,
      },
    });

    const existingOrderIds = existingOrders.map((order) => order.id);
    const nonExistingOrderIds = orderIds.filter(
      (id) => !existingOrderIds.includes(id)
    );

    if (nonExistingOrderIds.length > 0) {
      return res.status(404).json({
        success: false,
        message: "Some orders not found",
        nonExistingOrderIds,
        existingOrderIds,
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      // Update all orders
      const updateResult = await tx.customerOrders.updateMany({
        where: {
          id: {
            in: orderIds,
          },
        },
        data: {
          orderStatus,
          statusUpdate: new Date(),
        },
      });

      const updatedOrders = await tx.customerOrders.findMany({
        where: {
          id: {
            in: orderIds,
          },
        },
        include: {
          customer: {
            select: {
              id: true,
              customerNumber: true,
              vorname: true,
              nachname: true,
              email: true,
              wohnort: true,
            },
          },
          product: true,
          partner: {
            select: {
              id: true,
            },
          },
        },
      });

      for (const id of orderIds) {
        await tx.customerHistorie.updateMany({
          where: {
            eventId: id, // exact order ID
          },
          data: {
            note: `Einlagenauftrag ${id} erstellt & Einlagenauftrag ${id} ${orderStatus}`,
            updatedAt: new Date(),
          },
        });
      }

      for (const order of updatedOrders) {
        const previousHistoryRecord = await tx.customerOrdersHistory.findFirst({
          where: {
            orderId: order.id,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
          select: {
            statusTo: true,
          },
        });
        await tx.customerOrdersHistory.create({
          data: {
            orderId: order.id,
            statusFrom: previousHistoryRecord?.statusTo || order.orderStatus,
            statusTo: orderStatus,
            partnerId: order.partnerId,
            employeeId: (order as any).werkstattEmployeeId || null,
            note: `Status changed from ${order.orderStatus} to ${orderStatus}`,
          },
        });
      }

      return {
        updateCount: updateResult.count,
        updatedOrders,
      };
    });

    // Format orders with invoice URLs
    const formattedOrders = result.updatedOrders.map((order) => ({
      ...order,
      invoice: order.invoice ? getImageUrl(`/uploads/${order.invoice}`) : null,
    }));

    res.status(200).json({
      success: true,
      message: `Successfully updated ${result.updateCount} order(s) to status: ${orderStatus}`,
      data: formattedOrders,
      updatedCount: result.updateCount,
    });
  } catch (error: any) {
    console.error("Update Multiple Order Statuses Error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong while updating order statuses",
      error: error.message,
    });
  }
};

export const updateOrderPriority = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { priority } = req.body;

    const validPriorities = new Set(["Dringend", "Normal"]);

    if (!priority || !validPriorities.has(priority)) {
      return res.status(400).json({
        success: false,
        message: "Invalid priority value",
        error: `Priority must be one of: ${Array.from(validPriorities).join(
          ", "
        )}`,
        validPriorities: Array.from(validPriorities),
      });
    }

    const existingOrder = await prisma.customerOrders.findUnique({
      where: { id },
    });

    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const updatedOrder = await prisma.customerOrders.update({
      where: { id },
      data: {
        priority,
      },
    });

    // Format order with invoice URL
    const formattedOrder = {
      ...updatedOrder,
      invoice: updatedOrder.invoice
        ? getImageUrl(`/uploads/${updatedOrder.invoice}`)
        : null,
    };

    res.status(200).json({
      success: true,
      message: "Order priority updated successfully",
      data: formattedOrder,
    });
  } catch (error) {
    console.error("Update Order Priority Error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: (error as any).message,
    });
  }
};

export const uploadInvoice = async (req: Request, res: Response) => {
  const files = req.files as any;

  const sendToClient = (req.query.sendToClient ??
    (req.body as any)?.sendToClient) as string | boolean | undefined;

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
    const { orderId } = req.params;

    if (!files || !files.invoice || !files.invoice[0]) {
      return res.status(400).json({
        success: false,
        message: "Invoice PDF file is required",
      });
    }

    const invoiceFile = files.invoice[0];

    if (!invoiceFile.mimetype.includes("pdf")) {
      cleanupFiles();
      return res.status(400).json({
        success: false,
        message: "Only PDF files are allowed for invoices",
      });
    }

    const existingOrder = await prisma.customerOrders.findUnique({
      where: { id: orderId },
      select: { id: true, invoice: true },
    });

    if (!existingOrder) {
      cleanupFiles();
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (existingOrder.invoice) {
      const oldInvoicePath = path.join(
        process.cwd(),
        "uploads",
        existingOrder.invoice
      );
      if (fs.existsSync(oldInvoicePath)) {
        try {
          fs.unlinkSync(oldInvoicePath);
          console.log(`Deleted old invoice file: ${oldInvoicePath}`);
        } catch (err) {
          console.error(
            `Failed to delete old invoice file: ${oldInvoicePath}`,
            err
          );
        }
      }
    }

    const updatedOrder = await prisma.customerOrders.update({
      where: { id: orderId },
      data: {
        invoice: invoiceFile.filename,
      },
      include: {
        customer: {
          select: {
            id: true,
            customerNumber: true,
            vorname: true,
            nachname: true,
            email: true,
            // telefonnummer: true,
            wohnort: true,
          },
        },
        partner: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
          },
        },
        product: true,
      },
    });

    const formattedOrder = {
      ...updatedOrder,
      invoice: updatedOrder.invoice
        ? getImageUrl(`/uploads/${updatedOrder.invoice}`)
        : null,
      partner: updatedOrder.partner
        ? {
            ...updatedOrder.partner,
            image: updatedOrder.partner.image
              ? getImageUrl(`/uploads/${updatedOrder.partner.image}`)
              : null,
          }
        : null,
    };

    const shouldSend =
      typeof sendToClient === "string"
        ? ["true", "1", "yes"].includes(sendToClient.toLowerCase())
        : Boolean(sendToClient);

    let emailSent = false;
    if (shouldSend && updatedOrder.customer?.email) {
      try {
        sendInvoiceEmail(updatedOrder.customer.email, invoiceFile, {
          customerName:
            `${updatedOrder.customer.vorname} ${updatedOrder.customer.nachname}`.trim(),
          total: updatedOrder.totalPrice as any,
        });
        emailSent = true;
      } catch (emailErr) {
        console.error("Failed to send invoice email:", emailErr);
      }
    }

    res.status(200).json({
      success: true,
      message: "Invoice uploaded successfully",
      data: { ...formattedOrder, emailSent },
    });
  } catch (error: any) {
    console.error("Upload Invoice Error:", error);
    cleanupFiles();
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

export const uploadInvoiceOnly = async (req: Request, res: Response) => {
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
    const { orderId } = req.params;

    if (!files || !files.invoice || !files.invoice[0]) {
      return res.status(400).json({
        success: false,
        message: "Invoice PDF file is required",
      });
    }

    const invoiceFile = files.invoice[0];

    if (!invoiceFile.mimetype.includes("pdf")) {
      cleanupFiles();
      return res.status(400).json({
        success: false,
        message: "Only PDF files are allowed for invoices",
      });
    }

    const existingOrder = await prisma.customerOrders.findUnique({
      where: { id: orderId },
      select: { id: true, invoice: true },
    });

    if (!existingOrder) {
      cleanupFiles();
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Delete old invoice if exists
    if (existingOrder.invoice) {
      const oldInvoicePath = path.join(
        process.cwd(),
        "uploads",
        existingOrder.invoice
      );
      if (fs.existsSync(oldInvoicePath)) {
        try {
          fs.unlinkSync(oldInvoicePath);
          console.log(`Deleted old invoice file: ${oldInvoicePath}`);
        } catch (err) {
          console.error(
            `Failed to delete old invoice file: ${oldInvoicePath}`,
            err
          );
        }
      }
    }

    const updatedOrder = await prisma.customerOrders.update({
      where: { id: orderId },
      data: {
        invoice: invoiceFile.filename,
      },
      include: {
        customer: {
          select: {
            id: true,
            customerNumber: true,
            vorname: true,
            nachname: true,
            email: true,
            // telefonnummer: true,
            wohnort: true,
          },
        },
        partner: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
          },
        },
        product: true,
      },
    });

    const formattedOrder = {
      ...updatedOrder,
      invoice: updatedOrder.invoice
        ? getImageUrl(`/uploads/${updatedOrder.invoice}`)
        : null,
      partner: updatedOrder.partner
        ? {
            ...updatedOrder.partner,
            image: updatedOrder.partner.image
              ? getImageUrl(`/uploads/${updatedOrder.partner.image}`)
              : null,
          }
        : null,
    };

    res.status(200).json({
      success: true,
      message: "Invoice uploaded successfully",
      data: formattedOrder,
    });
  } catch (error: any) {
    console.error("Upload Invoice Only Error:", error);
    cleanupFiles();
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

export const sendInvoiceToCustomer = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    // Check if req.body exists and has email property
    const email = req.body?.email; // Optional: override customer email

    // console.log("Request body:", req.body);
    // console.log("Email from body:", email);
    // console.log("Request headers:", req.headers);
    // console.log("Content-Type:", req.headers['content-type']);

    const order = await prisma.customerOrders.findUnique({
      where: { id: orderId },
      include: {
        customer: {
          select: {
            id: true,
            customerNumber: true,
            vorname: true,
            nachname: true,
            email: true,
            // telefonnummer: true,
            wohnort: true,
          },
        },
        partner: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
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

    if (!order.invoice) {
      return res.status(400).json({
        success: false,
        message:
          "No invoice found for this order. Please upload an invoice first.",
      });
    }

    // Determine which email to use
    const targetEmail = email || order.customer?.email;

    if (!targetEmail) {
      return res.status(400).json({
        success: false,
        message: "No email address found for customer",
      });
    }

    // Get the invoice file
    const invoicePath = path.join(process.cwd(), "uploads", order.invoice);

    if (!fs.existsSync(invoicePath)) {
      return res.status(404).json({
        success: false,
        message: "Invoice file not found on server",
      });
    }

    const invoiceFile = {
      path: invoicePath,
      filename: order.invoice,
      mimetype: "application/pdf",
    };

    // Send invoice email
    try {
      sendInvoiceEmail(targetEmail, invoiceFile, {
        customerName:
          `${order.customer?.vorname} ${order.customer?.nachname}`.trim(),
        total: order.totalPrice as any,
      });

      const formattedOrder = {
        ...order,
        invoice: order.invoice
          ? getImageUrl(`/uploads/${order.invoice}`)
          : null,
        partner: order.partner
          ? {
              ...order.partner,
              image: order.partner.image
                ? getImageUrl(`/uploads/${order.partner.image}`)
                : null,
            }
          : null,
      };

      res.status(200).json({
        success: true,
        message: "Invoice sent successfully to customer",
        data: {
          ...formattedOrder,
          emailSent: true,
          sentTo: targetEmail,
        },
      });
    } catch (emailErr) {
      console.error("Failed to send invoice email:", emailErr);
      res.status(500).json({
        success: false,
        message: "Failed to send invoice email",
        error: emailErr.message,
      });
    }
  } catch (error: any) {
    console.error("Send Invoice Error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

export const deleteMultipleOrders = async (req: Request, res: Response) => {
  try {
    const { orderIds } = req.body;

    // Validate required field
    if (!orderIds) {
      return res.status(400).json({
        success: false,
        message: "Order IDs are required",
      });
    }

    // Validate orderIds is an array
    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order IDs must be a non-empty array",
      });
    }

    // Check if all orders exist
    const existingOrders = await prisma.customerOrders.findMany({
      where: {
        id: {
          in: orderIds,
        },
      },
      select: {
        id: true,
        invoice: true,
      },
    });

    const existingOrderIds = existingOrders.map((order) => order.id);
    const nonExistingOrderIds = orderIds.filter(
      (id) => !existingOrderIds.includes(id)
    );

    if (nonExistingOrderIds.length > 0) {
      return res.status(404).json({
        success: false,
        message: "Some orders not found",
        nonExistingOrderIds,
        existingOrderIds,
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      await tx.customerHistorie.deleteMany({
        where: {
          eventId: {
            in: orderIds,
          },
          category: "Bestellungen",
        },
      });

      await tx.storesHistory.deleteMany({
        where: {
          orderId: {
            in: orderIds,
          },
        },
      });

      const deleteResult = await tx.customerOrders.deleteMany({
        where: {
          id: {
            in: orderIds,
          },
        },
      });

      return {
        deleteCount: deleteResult.count,
      };
    });

    const fileDeletionPromises = existingOrders.map(async (order) => {
      if (order.invoice) {
        const invoicePath = path.join(process.cwd(), "uploads", order.invoice);
        if (fs.existsSync(invoicePath)) {
          try {
            fs.unlinkSync(invoicePath);
            console.log(`Deleted invoice file: ${invoicePath}`);
          } catch (err) {
            console.error(`Failed to delete invoice file: ${invoicePath}`, err);
          }
        }
      }
    });

    await Promise.allSettled(fileDeletionPromises);

    res.status(200).json({
      success: true,
      message: `Successfully deleted ${result.deleteCount} order(s)`,
      data: {
        deletedCount: result.deleteCount,
        deletedOrderIds: existingOrderIds,
      },
    });
  } catch (error: any) {
    console.error("Delete Multiple Orders Error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong while deleting orders",
      error: error.message,
    });
  }
};

export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const order = await prisma.customerOrders.findUnique({
      where: { id },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.invoice) {
      const invoicePath = path.join(process.cwd(), "uploads", order.invoice);
      if (fs.existsSync(invoicePath)) {
        try {
          fs.unlinkSync(invoicePath);
          console.log(`Deleted invoice file: ${invoicePath}`);
        } catch (err) {
          console.error(`Failed to delete invoice file: ${invoicePath}`, err);
        }
      }
    }

    await prisma.customerOrders.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete Order Error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

export const getLast40DaysOrderStats = async (req: Request, res: Response) => {
  try {
    let { year, month, status, includeAll } = req.query;
    const partnerId = req.user?.id;
    const userRole = req.user?.role;
    const requestedPartnerId = req.query.partnerId as string | undefined;

    const now = new Date();

    // Determine monthly mode
    const isMonthlyMode =
      typeof month !== "undefined" || typeof year !== "undefined";

    let startDate: Date;
    let endDate: Date;

    if (isMonthlyMode) {
      const yearNum = year ? parseInt(year as string) : now.getFullYear();
      const monthNum = month ? parseInt(month as string) : now.getMonth() + 1;

      if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
        return res.status(400).json({
          success: false,
          message: "Invalid year or month provided.",
        });
      }

      startDate = new Date(yearNum, monthNum - 1, 1, 0, 0, 0, 0);
      endDate = new Date(yearNum, monthNum, 0, 23, 59, 59, 999);
    } else {
      startDate = new Date();
      startDate.setDate(now.getDate() - 29);
      startDate.setHours(0, 0, 0, 0);

      endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
    }

    let statusFilter: any = {};
    if (status && typeof status === "string") {
      statusFilter.orderStatus = status;
    } else if (includeAll === "false") {
      statusFilter.orderStatus = {
        in: ["Ausgeführt"],
      };
    }

    const partnerFilter: any = {};
    if (userRole === "PARTNER") {
      partnerFilter.partnerId = partnerId;
    } else if (requestedPartnerId) {
      partnerFilter.partnerId = requestedPartnerId;
    }

    const [allOrders, ordersInProduction, completedOrders] = await Promise.all([
      prisma.customerOrders.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          ...statusFilter,
          ...partnerFilter,
        },
        select: {
          totalPrice: true,
          createdAt: true,
        },
      }),

      prisma.customerOrders.count({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          ...partnerFilter,
          orderStatus: {
            in: [
              "In_Fertigung",
              "Verpacken_Qualitätssicherung",
              "Abholbereit_Versandt",
            ],
          },
        },
      }),

      prisma.customerOrders.count({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          ...partnerFilter,
          orderStatus: {
            in: ["Ausgeführt"],
          },
        },
      }),
    ]);

    const dateRange: string[] = [];
    const cursor = new Date(startDate);
    while (cursor <= endDate) {
      dateRange.push(cursor.toISOString().split("T")[0]);
      cursor.setDate(cursor.getDate() + 1);
    }

    const daysInRange = dateRange.length;

    const revenueMap = new Map<string, { revenue: number; count: number }>();
    allOrders.forEach((order) => {
      const dateKey = order.createdAt.toISOString().split("T")[0];
      const existing = revenueMap.get(dateKey) || { revenue: 0, count: 0 };
      revenueMap.set(dateKey, {
        revenue: existing.revenue + (order.totalPrice || 0),
        count: existing.count + 1,
      });
    });

    const chartData = dateRange.map((dateKey) => {
      const dayData = revenueMap.get(dateKey) || { revenue: 0, count: 0 };
      return {
        date: formatChartDate(dateKey),
        value: Math.round(dayData.revenue),
      };
    });

    let totalRevenue = 0;
    let totalOrders = 0;
    let maxRevenue = -Infinity;
    let minRevenue = Infinity;

    dateRange.forEach((d) => {
      const dayData = revenueMap.get(d) || { revenue: 0, count: 0 };
      const revenue = dayData.revenue;
      totalRevenue += revenue;
      totalOrders += dayData.count;
      if (revenue > maxRevenue) maxRevenue = revenue;
      if (revenue < minRevenue) minRevenue = revenue;
    });

    if (maxRevenue === -Infinity) maxRevenue = 0;
    if (minRevenue === Infinity) minRevenue = 0;

    const averageDailyRevenue =
      daysInRange > 0 ? Math.round(totalRevenue / daysInRange) : 0;
    const maxRevenueDay =
      chartData.find((d) => d.value === Math.round(maxRevenue)) || chartData[0];
    const minRevenueDay =
      chartData.find((d) => d.value === Math.round(minRevenue)) || chartData[0];

    const label = isMonthlyMode
      ? `Order statistics for ${startDate.toISOString().slice(0, 7)}`
      : `Order statistics from ${dateRange[0]} to ${
          dateRange[dateRange.length - 1]
        }`;

    res.status(200).json({
      success: true,
      message: label + " fetched successfully.",
      data: {
        chartData,
        statistics: {
          totalRevenue: Math.round(totalRevenue),
          averageDailyRevenue,
          maxRevenueDay,
          minRevenueDay,
          totalOrders,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          daysInRange,
        },
        count: ordersInProduction,
        totalPrice: completedOrders, // This is actually the count of completed orders (quantity)
      },
    });
  } catch (error: any) {
    console.error("Get Last 30 Days Stats Error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong while fetching order stats.",
      error: error.message,
    });
  }
};

const formatChartDate = (dateString: string): string => {
  const date = new Date(dateString);
  const month = date.toLocaleString("en-US", { month: "short" });
  const day = date.getDate().toString().padStart(2, "0");
  return `${month} ${day}`;
};

export const getEinlagenInProduktion = async (req: Request, res: Response) => {
  try {
    const partnerId = req.user?.id;
    const userRole = req.user?.role;
    const requestedPartnerId = req.query.partnerId as string | undefined;

    const partnerFilter: any = {};
    if (userRole === "PARTNER") {
      partnerFilter.partnerId = partnerId;
    } else if (requestedPartnerId) {
      partnerFilter.partnerId = requestedPartnerId;
    }

    const activeStatuses = [
      "In_Fertigung",
      "Verpacken_Qualitätssicherung",
      "Abholbereit_Versandt",
    ];

    const count = await prisma.customerOrders.count({
      where: {
        ...partnerFilter,
        orderStatus: {
          in: activeStatuses,
        },
      },
    });

    const einlagen = await prisma.customerOrders.count({
      where: {
        ...partnerFilter,
        orderStatus: {
          in: ["Ausgeführt"],
        },
      },
    });

    // const totalPrice = einlagen.reduce(
    //   (acc, order) => acc + (order.totalPrice || 0),
    //   0
    // );

    res.status(200).json({
      success: true,
      data: count,
      totalPrice: einlagen,
    });
  } catch (error: any) {
    console.error("Get Active Orders Count Error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong while fetching active orders count",
      error: error.message,
    });
  }
};

export const getLast30DaysOrderEinlagen = async (
  req: Request,
  res: Response
) => {
  try {
    // i need only this user data not other, thare are other more data
    const partnerId = req.user?.id;
    const userRole = req.user?.role;
    const requestedPartnerId = req.query.partnerId as string | undefined;

    const partnerFilter: any = {};
    if (userRole === "PARTNER") {
      partnerFilter.partnerId = partnerId;
    } else if (requestedPartnerId) {
      partnerFilter.partnerId = requestedPartnerId;
    }

    const einlagen = await prisma.customerOrders.findMany({
      where: {
        orderStatus: {
          in: ["Ausgeführt"],
        },
        createdAt: {
          gte: new Date(new Date().setDate(new Date().getDate() - 30)),
        },
        ...partnerFilter,
      },
      select: {
        totalPrice: true,
      },
    });

    const totalPrice = einlagen.reduce(
      (acc, order) => acc + order.totalPrice,
      0
    );

    res.status(200).json({
      success: true,
      message: "Last 30 days order einlagen fetched successfully",
      data: {
        totalPrice: totalPrice,
      },
    });
  } catch (error: any) {
    console.error("Get Last 30 Days Order Einlagen Error:", error);
    res.status(500).json({
      success: false,
      message:
        "Something went wrong while fetching last 30 days order einlagen",
      error: error.message,
    });
  }
};

//-----------------------------------------------------------------
// Helper function to format duration
const formatDuration = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    const remainingHours = hours % 24;
    const remainingMinutes = minutes % 60;
    if (remainingHours > 0 && remainingMinutes > 0) {
      return `${days}T ${remainingHours}h ${remainingMinutes}m`;
    } else if (remainingHours > 0) {
      return `${days}T ${remainingHours}h`;
    } else if (remainingMinutes > 0) {
      return `${days}T ${remainingMinutes}m`;
    }
    return `${days}T`;
  }

  if (hours > 0) {
    const remainingMinutes = minutes % 60;
    if (remainingMinutes > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${hours}h`;
  }

  if (minutes > 0) {
    return `${minutes}m`;
  }

  return `${seconds}s`;
};

// Helper function to format status name for display (German format)
const formatStatusName = (status: string): string => {
  return status.replace(/_/g, " ");
};

//3 panda
export const getOrdersHistory = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    // Get order with all necessary relations
    const order = await prisma.customerOrders.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        orderNumber: true,
        orderStatus: true,
        createdAt: true,
        statusUpdate: true,
        partner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Get order status history
    const orderHistory = await prisma.customerOrdersHistory.findMany({
      where: { orderId, isPrementChange: false },
      orderBy: { createdAt: "asc" },
      include: {
        partner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        employee: {
          select: {
            id: true,
            employeeName: true,
            email: true,
          },
        },
      },
    });

    // Get customer history entries related to this order
    const customerHistory = await prisma.customerHistorie.findMany({
      where: {
        eventId: orderId,
        category: "Bestellungen",
      },
      orderBy: { createdAt: "asc" },
    });

    // Calculate status durations
    const statusDurations: Array<{
      status: string;
      statusDisplay: string;
      duration: string;
      durationMs: number;
      startDate: Date;
      endDate: Date | null;
      assignee: string;
      assigneeId: string | null;
      assigneeType: "employee" | "partner" | "system";
    }> = [];

    // Track status transitions
    const statusTransitions: Array<{
      status: string;
      startTime: Date;
      endTime: Date | null;
      assignee: string;
      assigneeId: string | null;
      assigneeType: "employee" | "partner" | "system";
    }> = [];

    // Process order history to calculate durations
    if (orderHistory.length > 0) {
      // Filter out records where statusFrom === statusTo (initial creation records)
      const actualStatusChanges = orderHistory.filter(
        (record) => record.statusFrom !== record.statusTo
      );

      // Determine initial status from first record
      const firstRecord = orderHistory[0];
      const initialStatus =
        firstRecord.statusFrom === firstRecord.statusTo
          ? firstRecord.statusTo
          : firstRecord.statusFrom;

      // Track initial status from order creation
      let statusStartTime = order.createdAt;
      let statusAssignee =
        (order as any).mitarbeiter || (order as any).partner?.name || "System";
      let statusAssigneeId =
        (order as any).werkstattEmployeeId || (order as any).partnerId || null;
      let statusAssigneeType: "employee" | "partner" | "system" = (order as any)
        .werkstattEmployeeId
        ? "employee"
        : (order as any).partnerId
        ? "partner"
        : "system";

      // Process each status change
      for (let i = 0; i < actualStatusChanges.length; i++) {
        const record = actualStatusChanges[i];
        const nextRecord = actualStatusChanges[i + 1];

        // Record duration for the status that's ending
        const statusEndTime = record.createdAt;
        statusTransitions.push({
          status: record.statusFrom,
          startTime: statusStartTime,
          endTime: statusEndTime,
          assignee: statusAssignee,
          assigneeId: statusAssigneeId,
          assigneeType: statusAssigneeType,
        });

        // Start tracking the new status
        statusStartTime = record.createdAt;
        statusAssignee =
          record.employee?.employeeName || record.partner?.name || "System";
        statusAssigneeId = record.employee?.id || record.partner?.id || null;
        statusAssigneeType = record.employee?.id
          ? "employee"
          : record.partner?.id
          ? "partner"
          : "system";
      }

      // Track current status (the last status the order is in)
      const currentStatus =
        actualStatusChanges.length > 0
          ? actualStatusChanges[actualStatusChanges.length - 1].statusTo
          : initialStatus;

      statusTransitions.push({
        status: currentStatus,
        startTime: statusStartTime,
        endTime: null, // Still in this status
        assignee: statusAssignee,
        assigneeId: statusAssigneeId,
        assigneeType: statusAssigneeType,
      });
    } else {
      // No history records, order is still in initial status
      const duration = new Date().getTime() - order.createdAt.getTime();
      statusTransitions.push({
        status: order.orderStatus,
        startTime: order.createdAt,
        endTime: null,
        assignee:
          (order as any).mitarbeiter ||
          (order as any).partner?.name ||
          "System",
        assigneeId:
          (order as any).werkstattEmployeeId ||
          (order as any).partnerId ||
          null,
        assigneeType: (order as any).werkstattEmployeeId
          ? "employee"
          : (order as any).partnerId
          ? "partner"
          : "system",
      });
    }

    // Convert transitions to duration objects
    statusDurations.push(
      ...statusTransitions.map((transition) => ({
        status: transition.status,
        statusDisplay: formatStatusName(transition.status),
        duration: formatDuration(
          transition.endTime
            ? transition.endTime.getTime() - transition.startTime.getTime()
            : new Date().getTime() - transition.startTime.getTime()
        ),
        durationMs: transition.endTime
          ? transition.endTime.getTime() - transition.startTime.getTime()
          : new Date().getTime() - transition.startTime.getTime(),
        startDate: transition.startTime,
        endDate: transition.endTime,
        assignee: transition.assignee,
        assigneeId: transition.assigneeId,
        assigneeType: transition.assigneeType,
      }))
    );

    // Format change log entries
    const changeLog: Array<{
      id: string;
      date: Date;
      user: string;
      action: string;
      note: string;
      type: "status_change" | "order_creation" | "approval_change" | "other";
      details: {
        partnerId: string | null;
        employeeId: string | null;
      };
    }> = [];

    // Add order creation entry
    changeLog.push({
      id: "initial",
      date: order.createdAt,
      user: order.partner?.name || "System",
      action: "Auftrag erstellt",
      note: `System erstellte Auftrag: ${formatStatusName(order.orderStatus)}`,
      type: "order_creation",
      details: {
        partnerId: order.partner?.id || null,
        employeeId: (order as any).werkstattEmployeeId || null,
      },
    });

    // Add status change entries
    orderHistory.forEach((record) => {
      changeLog.push({
        id: record.id,
        date: record.createdAt,
        user: record.employee?.employeeName || record.partner?.name || "System",
        action: `Status geändert: ${formatStatusName(
          record.statusFrom
        )} → ${formatStatusName(record.statusTo)}`,
        note:
          record.note ||
          `${
            record.employee?.employeeName || record.partner?.name || "System"
          } änderte Status: ${formatStatusName(
            record.statusFrom
          )} → ${formatStatusName(record.statusTo)}`,
        type: "status_change",
        details: {
          partnerId: record.partnerId || null,
          employeeId: record.employeeId || null,
        },
      });
    });

    // Helper to extract user name from note (e.g., "Anna Müller änderte..." -> "Anna Müller")
    const extractUserNameFromNote = (note: string | null): string => {
      if (!note) return "System";
      const match = note.match(
        /^([A-ZÄÖÜ][a-zäöüß]+(?:\s+[A-ZÄÖÜ][a-zäöüß]+)*)\s+(änderte|changed|erstellte|created)/i
      );
      return match ? match[1] : "System";
    };

    // Add customer history entries (like approval changes)
    customerHistory.forEach((record) => {
      // Skip duplicate entries that are already in orderHistory
      const isDuplicate = changeLog.some(
        (entry) =>
          entry.type === "status_change" &&
          Math.abs(
            new Date(entry.date).getTime() -
              new Date(record.createdAt || record.date || new Date()).getTime()
          ) < 1000 // Within 1 second
      );

      if (isDuplicate) return;

      // Check for approval status changes
      if (
        record.note &&
        (record.note.includes("Genehmigungsstatus") ||
          record.note.includes("approval") ||
          record.note.includes("Approval") ||
          record.note.includes("Genehmigt"))
      ) {
        const userName = extractUserNameFromNote(record.note);
        changeLog.push({
          id: record.id,
          date: record.createdAt || record.date || new Date(),
          user: userName,
          action: "Genehmigungsstatus geändert",
          note: record.note,
          type: "approval_change",
          details: {
            partnerId: null,
            employeeId: null,
          },
        });
      } else if (
        record.note &&
        !record.note.includes("erstellt") &&
        !record.note.includes("Status:") &&
        !record.note.includes("→")
      ) {
        // Other history entries (exclude status changes and creation notes)
        const userName = extractUserNameFromNote(record.note);
        changeLog.push({
          id: record.id,
          date: record.createdAt || record.date || new Date(),
          user: userName,
          action: record.note || "Eintrag aktualisiert",
          note: record.system_note || record.note || "",
          type: "other",
          details: {
            partnerId: null,
            employeeId: null,
          },
        });
      }
    });

    // Sort change log by date descending
    changeLog.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    res.status(200).json({
      success: true,
      data: {
        orderNumber: order.orderNumber,
        stepDurations: statusDurations.map((sd) => ({
          status: sd.status,
          statusDisplay: sd.statusDisplay,
          duration: sd.duration,
          assignee: sd.assignee,
          assigneeId: sd.assigneeId,
          assigneeType: sd.assigneeType,
        })),
        changeLog: changeLog.map((entry) => ({
          id: entry.id,
          date: entry.date,
          user: entry.user,
          action: entry.action,
          note: entry.note,
          type: entry.type,
          details: entry.details,
        })),
        totalEntries: changeLog.length,
      },
    });
  } catch (error: any) {
    console.error("Get Order History Error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong while fetching order history",
      error: error.message,
    });
  }
};

export const getNewOrderHistory = async (req: Request, res: Response) => {
  // Helper functions
  const formatDateGerman = (date: Date): string => {
    return date.toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    // Get order with all necessary relations
    const order = await prisma.customerOrders.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        orderNumber: true,
        orderStatus: true,
        createdAt: true,
        statusUpdate: true,
        barcodeScannedAt: true, // ✅ নতুন field
        partner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // ✅ STEP 1: Calculate Step Durations

    // Get all order history (status changes)
    const allHistory = await prisma.customerOrdersHistory.findMany({
      where: { orderId },
      orderBy: { createdAt: "asc" },
    });

    // 1A. First status start time (প্রথম স্টেপ কখন শুরু হয়েছিল)
    const firstStatusRecord = allHistory.find(
      (record) =>
        !record.isPrementChange && record.statusFrom !== record.statusTo
    );

    const startDate = firstStatusRecord
      ? firstStatusRecord.createdAt
      : order.createdAt;

    // 1B. Calculate In_Fertigung + Verpacken_Qualitätssicherung total time
    let fertigungQSSeconds = 0;

    // Track when In_Fertigung started
    let fertigungStartTime: Date | null = null;
    let qsStartTime: Date | null = null;

    for (const record of allHistory) {
      if (record.isPrementChange) continue; // Skip payment changes

      // Check if status changed to In_Fertigung
      if (record.statusTo === "In_Fertigung") {
        fertigungStartTime = record.createdAt;
      }
      // Check if status changed FROM In_Fertigung
      else if (record.statusFrom === "In_Fertigung") {
        if (fertigungStartTime) {
          const duration =
            record.createdAt.getTime() - fertigungStartTime.getTime();
          fertigungQSSeconds += Math.floor(duration / 1000);
          fertigungStartTime = null;
        }
      }

      // Check if status changed to Verpacken_Qualitätssicherung
      if (record.statusTo === "Verpacken_Qualitätssicherung") {
        qsStartTime = record.createdAt;
      }
      // Check if status changed FROM Verpacken_Qualitätssicherung
      else if (record.statusFrom === "Verpacken_Qualitätssicherung") {
        if (qsStartTime) {
          const duration = record.createdAt.getTime() - qsStartTime.getTime();
          fertigungQSSeconds += Math.floor(duration / 1000);
          qsStartTime = null;
        }
      }
    }

    // Format durations
    const formatGermanTime = (seconds: number): string => {
      const days = Math.floor(seconds / (24 * 3600));
      const hours = Math.floor((seconds % (24 * 3600)) / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);

      const parts = [];
      if (days > 0) parts.push(`${days} Tag${days > 1 ? "e" : ""}`);
      if (hours > 0) parts.push(`${hours} Std`);
      if (minutes > 0) parts.push(`${minutes} Min`);

      return parts.join(" ") || "0 Min";
    };

    // ✅ STEP 2: Build Change Log
    const changeLog: Array<{
      id: string;
      date: Date;
      user: string;
      action: string;
      note: string;
      type:
        | "status_change"
        | "payment_change"
        | "scan_event"
        | "order_creation"
        | "other";
    }> = [];

    // Add order creation
    changeLog.push({
      id: "initial",
      date: order.createdAt,
      user: order.partner?.name || "System",
      action: "Auftrag erstellt",
      note: `Order #${order.orderNumber} created`,
      type: "order_creation",
    });

    // Add barcode scan event if exists
    if (order.barcodeScannedAt) {
      changeLog.push({
        id: "barcode_scan",
        date: order.barcodeScannedAt,
        user: "System",
        action: "Barcode gescannt",
        note: "Barcode/Label wurde gescannt",
        type: "scan_event",
      });
    }

    // Add history entries
    const allHistoryWithUsers = await prisma.customerOrdersHistory.findMany({
      where: { orderId },
      orderBy: { createdAt: "asc" },
      include: {
        partner: { select: { name: true } },
        employee: { select: { employeeName: true } },
      },
    });

    for (const record of allHistoryWithUsers) {
      const userName =
        record.employee?.employeeName || record.partner?.name || "System";

      if (record.isPrementChange) {
        // Payment change
        changeLog.push({
          id: record.id,
          date: record.createdAt,
          user: userName,
          action: `Zahlungsstatus geändert: ${record.paymentFrom || "N/A"} → ${
            record.paymentTo || "N/A"
          }`,
          note: record.note || "Payment status changed",
          type: "payment_change",
        });
      } else if (record.statusFrom !== record.statusTo) {
        // Status change
        changeLog.push({
          id: record.id,
          date: record.createdAt,
          user: userName,
          action: `Status geändert: ${record.statusFrom} → ${record.statusTo}`,
          note: record.note || "Status changed",
          type: "status_change",
        });
      }
    }

    // Sort by date descending
    changeLog.sort((a, b) => b.date.getTime() - a.date.getTime());

    // ✅ STEP 3: Response
    res.status(200).json({
      success: true,
      data: {
        // Step Duration Overview
        stepDurations: {
          startDate: {
            label: "Startdatum",
            value: formatDateGerman(startDate),
            timestamp: startDate,
          },
          fertigungQSDuration: {
            label: "Fertigung + QS Dauer",
            value: formatGermanTime(fertigungQSSeconds),
            seconds: fertigungQSSeconds,
          },
        },

        // Change Log (Änderungsprotokoll)
        changeLog: changeLog.map((entry) => ({
          id: entry.id,
          date: formatDateGerman(entry.date),
          timestamp: entry.date,
          user: entry.user,
          action: entry.action,
          note: entry.note,
          type: entry.type,
        })),

        // Summary
        summary: {
          orderNumber: order.orderNumber,
          totalHistoryEntries: changeLog.length,
          currentStatus: order.orderStatus,
        },
      },
    });
  } catch (error: any) {
    console.error("Get Order History Error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong while fetching order history",
      error: error.message,
    });
  }
};

export const getSupplyInfo = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    // First, check if the order exists
    const order = await prisma.customerOrders.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        orderNumber: true,
        versorgungId: true,
        productId: true,
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Fetch product if exists
    let productData = null;
    if (order.productId) {
      productData = await prisma.customerProduct.findUnique({
        where: { id: order.productId },
        select: {
          id: true,
          name: true,
          material: true,
          langenempfehlung: true,
          rohlingHersteller: true,
          artikelHersteller: true,
          versorgung: true,
          status: true,
          diagnosis_status: true,
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        orderNumber: order.orderNumber,
        productId: order.productId,
        product: productData,
      },
    });
  } catch (error: any) {
    console.error("Get Supply Info Error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong while fetching supply info",
      error: error.message,
    });
  }
};

export const getPicture2324ByOrderId = async (req: Request, res: Response) => {
  try {
    // Get the picture 23 and 24 from the customer screener file
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    // Get customer and product/versorgung information for this order
    const order = await prisma.customerOrders.findUnique({
      where: { id: orderId },
      select: {
        customer: {
          select: {
            id: true,
            vorname: true,
            nachname: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            diagnosis_status: true,
            material: true,
          },
        },
      },
    });

    if (!order || !order.customer) {
      return res.status(404).json({
        success: false,
        message: "Order or customer not found",
      });
    }

    const customerScreenerFile = await prisma.screener_file.findFirst({
      where: { customerId: order.customer.id },
      orderBy: { createdAt: "desc" },
      select: {
        picture_23: true,
        picture_24: true,
      },
    });

    if (!customerScreenerFile) {
      return res.status(404).json({
        success: false,
        message: "Customer screener file not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        customerName: `${order.customer.vorname} ${order.customer.nachname}`,
        // Use data from customerProduct (same as in getSupplyInfo)
        versorgungName: order.product?.name ?? null,
        diagnosisStatus: order.product?.diagnosis_status ?? null,
        material: order.product?.material ?? null,
        // customerId: order.customer.id,
        picture_23: customerScreenerFile.picture_23
          ? getImageUrl(`/uploads/${customerScreenerFile.picture_23}`)
          : null,
        picture_24: customerScreenerFile.picture_24
          ? getImageUrl(`/uploads/${customerScreenerFile.picture_24}`)
          : null,
      },
    });
  } catch (error: any) {
    console.error("Get Picture 23 24 By Order ID Error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong while fetching picture 23 24",
      error: error.message,
    });
  }
};

export const getBarcodeLabel = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    // Get order with partner info (avatar, address) and customer info
    const order = await prisma.customerOrders.findUnique({
      where: { id: orderId },
      select: {
        orderNumber: true,
        orderStatus: true,
        geschaeftsstandort: true,
        createdAt: true,
        updatedAt: true,
        customer: {
          select: {
            vorname: true,
            nachname: true,
            customerNumber: true,
          },
        },
        partner: {
          select: {
            id: true,
            name: true,
            image: true,
            hauptstandort: true,
            busnessName: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Get the time when order status changed to "Ausgeführt" if applicable
    let completedAt: Date | null = null;
    if (order.orderStatus === "Ausgeführt") {
      const statusHistory = await prisma.customerOrdersHistory.findFirst({
        where: {
          orderId: orderId,
          statusTo: "Ausgeführt",
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          createdAt: true,
        },
      });
      completedAt = statusHistory?.createdAt || null;
    }

    // Format partner address from hauptstandort array
    const partnerAddress = order.partner.hauptstandort
      ? order.partner.hauptstandort.join(", ")
      : null;

    res.status(200).json({
      success: true,
      data: {
        partner: {
          name: order.partner.name || order.partner.busnessName || null,
          image: order.partner.image
            ? getImageUrl(`/uploads/${order.partner.image}`)
            : null,
        },
        customer: `${order.customer.vorname} ${order.customer.nachname}`,
        customerNumber: order.customer.customerNumber,
        orderNumber: order.orderNumber,
        orderStatus: order.orderStatus,
        completedAt: completedAt, // Time when status changed to "Ausgeführt"
        partnerAddress: order.geschaeftsstandort,
      },
    });
  } catch (error: any) {
    console.error("Get Barcode Label Error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong while fetching barcode label",
      error: error.message,
    });
  }
};

export const uploadBarcodeLabel = async (req: Request, res: Response) => {
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
    const { orderId } = req.params;

    if (!files || !files.image || !files.image[0]) {
      return res.status(400).json({
        success: false,
        message: "Barcode label image file is required",
      });
    }

    const imageFile = files.image[0];

    // Check if order exists and get current barcode label
    const existingOrder = await prisma.customerOrders.findUnique({
      where: { id: orderId },
      select: { id: true, barcodeLabel: true },
    });

    if (!existingOrder) {
      cleanupFiles();
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Delete old barcode label file if it exists
    if (existingOrder.barcodeLabel) {
      const oldBarcodePath = path.join(
        process.cwd(),
        "uploads",
        existingOrder.barcodeLabel
      );
      if (fs.existsSync(oldBarcodePath)) {
        try {
          fs.unlinkSync(oldBarcodePath);
          console.log(`Deleted old barcode label file: ${oldBarcodePath}`);
        } catch (err) {
          console.error(
            `Failed to delete old barcode label file: ${oldBarcodePath}`,
            err
          );
        }
      }
    }

    // Update order with new barcode label filename
    const updatedOrder = await prisma.customerOrders.update({
      where: { id: orderId },
      data: {
        barcodeLabel: imageFile.filename,
        barcodeCreatedAt: new Date(),
      },
      select: {
        id: true,
        orderNumber: true,
        barcodeLabel: true,
        barcodeCreatedAt: true,
        customer: {
          select: {
            vorname: true,
            nachname: true,
            customerNumber: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Barcode label uploaded successfully",
      data: {
        orderId: updatedOrder.id,
        orderNumber: updatedOrder.orderNumber,
        barcodeLabel: updatedOrder.barcodeLabel
          ? getImageUrl(`/uploads/${updatedOrder.barcodeLabel}`)
          : null,
        customer: `${updatedOrder.customer.vorname} ${updatedOrder.customer.nachname}`,
        customerNumber: updatedOrder.customer.customerNumber,
      },
    });
  } catch (error: any) {
    cleanupFiles();
    console.error("Upload Barcode Label Error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong while uploading barcode label",
      error: error.message,
    });
  }
};
