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

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { customerId, versorgungId, werkstattzettelId } = req.body;
    const partnerId = req.user.id;

    console.log(customerId, versorgungId, partnerId, werkstattzettelId);

    if (!customerId || !versorgungId) {
      return res.status(400).json({
        success: false,
        message: "Customer ID and Versorgung ID are required",
      });
    }

    const [customer, versorgung, werkstattzettel] = await Promise.all([
      prisma.customers.findUnique({
        where: { id: customerId },
        select: {
          fußanalyse: true,
          einlagenversorgung: true,
          fusslange1: true,
          fusslange2: true,
        },
      }),
      prisma.versorgungen.findUnique({
        where: { id: versorgungId },
        select: {
          name: true,
          rohlingHersteller: true,
          artikelHersteller: true,
          versorgung: true,
          material: true,
          langenempfehlung: true,
          status: true,
          diagnosis_status: true,
          storeId: true,
        },
      }),
      prisma.werkstattzettel.findUnique({
        where: { id: werkstattzettelId },
      }),
    ]);

    if (!customer || !versorgung) {
      return res
        .status(404)
        .json({ success: false, message: "Customer or Versorgung not found" });
    }

    if (customer.fußanalyse == null || customer.einlagenversorgung == null) {
      return res.status(400).json({
        success: false,
        message:
          "fußanalyse or einlagenversorgung price is not set for this customer",
      });
    }

    if (!werkstattzettel) {
      res.status(400).json({
        success: false,
        message: "werkstattzettel id not found",
      });
    }

    const totalPrice = customer.fußanalyse + customer.einlagenversorgung;

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
          material: versorgung.material,
          langenempfehlung: versorgung.langenempfehlung,
          status: versorgung.status,
          diagnosis_status: versorgung.diagnosis_status,
        },
      });

      // Create order first so we can use its ID in StoresHistory
      const newOrder = await tx.customerOrders.create({
        data: {
          customerId,
          partnerId,
          werkstattzettelId,
          fußanalyse: customer.fußanalyse,
          einlagenversorgung: customer.einlagenversorgung,
          totalPrice,
          productId: customerProduct.id,
          statusUpdate: new Date(),
        },
        select: { id: true },
      });

      // Decrement store stock for the matched size (if storeId present)
      if (versorgung.storeId) {
        const store = await tx.stores.findUnique({
          where: { id: versorgung.storeId },
          select: { id: true, groessenMengen: true, userId: true },
        });

        if (
          store &&
          store.groessenMengen &&
          typeof store.groessenMengen === "object"
        ) {
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

          if (!storeMatchedSizeKey) {
            throw new Error("NO_MATCHED_SIZE_IN_STORE");
          }

          const sizeValue = sizes[storeMatchedSizeKey];
          let currentQty: number;
          // Handle new format: { quantity: number, length: number }
          if (
            sizeValue &&
            typeof sizeValue === "object" &&
            "quantity" in sizeValue
          ) {
            currentQty = Number(sizeValue.quantity ?? 0);
          }
          // Handle old format: number (backward compatibility)
          else if (typeof sizeValue === "number") {
            currentQty = sizeValue;
          } else {
            currentQty = 0;
          }

          const newQty = Math.max(currentQty - 1, 0);

          if (
            sizeValue &&
            typeof sizeValue === "object" &&
            "quantity" in sizeValue
          ) {
            sizes[storeMatchedSizeKey] = {
              ...sizeValue,
              quantity: newQty,
            };
          } else if (typeof sizeValue === "number") {
            sizes[storeMatchedSizeKey] = newQty;
          } else {
            sizes[storeMatchedSizeKey] = {
              quantity: newQty,
            };
          }

          await tx.stores.update({
            where: { id: store.id },
            data: { groessenMengen: sizes },
          });

          // Create StoresHistory with customerId and orderId
          await tx.storesHistory.create({
            data: {
              storeId: store.id,
              changeType: "sales",
              quantity: currentQty > 0 ? 1 : 0,
              newStock: newQty,
              reason: `Order size ${storeMatchedSizeKey}`,
              partnerId: store.userId,
              customerId: customerId,
              orderId: newOrder.id,
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
          note: "New order created",
          system_note: "New order created",
          paymentIs: totalPrice.toString(),
        },
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
      fußanalyse: true,
      einlagenversorgung: true,
      fusslange1: true,
      fusslange2: true,
    },
  });
};

const fetchVersorgungData = async (versorgungId: string) => {
  return prisma.versorgungen.findUnique({
    where: { id: versorgungId },
    select: {
      name: true,
      rohlingHersteller: true,
      artikelHersteller: true,
      versorgung: true,
      material: true,
      langenempfehlung: true,
      status: true,
      diagnosis_status: true,
      storeId: true,
    },
  });
};

const fetchWerkstattzettelData = async (werkstattzettelId?: string) => {
  if (!werkstattzettelId) return null;
  return prisma.werkstattzettel.findUnique({
    where: { id: werkstattzettelId },
  });
};

const validateData = (customer: any, versorgung: any, werkstattzettel: any) => {
  if (!customer || !versorgung) {
    return {
      success: false,
      message: "Customer or Versorgung not found",
      status: 404,
    };
  }

  if (customer.fußanalyse == null || customer.einlagenversorgung == null) {
    return {
      success: false,
      message:
        "fußanalyse or einlagenversorgung price is not set for this customer",
      status: 400,
    };
  }

  if (werkstattzettel === undefined) {
    return {
      success: false,
      message: "werkstattzettel id not found",
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

const calculateTotalPrice = (customer: any): number => {
  return (customer.fußanalyse || 0) + (customer.einlagenversorgung || 0);
};

const determineProductSize = (
  customer: any,
  versorgung: any
): string | null => {
  const largerFusslange = Math.max(
    Number(customer.fusslange1) + 5,
    Number(customer.fusslange2) + 5
  );

  if (
    !versorgung.langenempfehlung ||
    typeof versorgung.langenempfehlung !== "object"
  ) {
    return null;
  }

  let matchedSizeKey: string | null = null;
  let smallestDiff = Infinity;

  for (const [sizeKey, sizeData] of Object.entries(
    versorgung.langenempfehlung as any
  )) {
    const lengthValue = extractLengthValue(sizeData);
    if (lengthValue === null) {
      continue;
    }
    const diff = Math.abs(largerFusslange - lengthValue);
    if (diff < smallestDiff) {
      smallestDiff = diff;
      matchedSizeKey = sizeKey;
    }
  }

  return matchedSizeKey;
};

const createOrderTransaction = async (
  tx: any,
  params: {
    customerId: string;
    partnerId: string;
    werkstattzettelId?: string;
    customer: any;
    versorgung: any;
    totalPrice: number;
    matchedSizeKey: string;
  }
) => {
  const {
    customerId,
    partnerId,
    werkstattzettelId,
    customer,
    versorgung,
    totalPrice,
    matchedSizeKey,
  } = params;

  // Create customer product
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

  // Create order
  const newOrder = await tx.customerOrders.create({
    data: {
      customerId,
      partnerId,
      werkstattzettelId,
      fußanalyse: customer.fußanalyse,
      einlagenversorgung: customer.einlagenversorgung,
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

  if (
    !store ||
    !store.groessenMengen ||
    typeof store.groessenMengen !== "object"
  ) {
    return;
  }

  const sizes = { ...(store.groessenMengen as any) };
  const sizeData = sizes[matchedSizeKey];

  if (!sizeData) {
    return; // Size not found in store
  }

  let currentQuantity: number;
  let currentLength: number;

  // Handle both data formats
  if (sizeData && typeof sizeData === "object" && "quantity" in sizeData) {
    currentQuantity = Number(sizeData.quantity ?? 0);
    currentLength = Number(sizeData.length ?? 0);
  } else if (typeof sizeData === "number") {
    currentQuantity = sizeData;
    currentLength = 0;
  } else {
    return; // Invalid data format
  }

  // Decrement quantity by 1 (minimum 0)
  const newQuantity = Math.max(currentQuantity - 1, 0);

  // Update with consistent format
  sizes[matchedSizeKey] = {
    quantity: newQuantity,
    length: currentLength,
  };

  // Update store
  await tx.stores.update({
    where: { id: store.id },
    data: { groessenMengen: sizes },
  });

  // Create stock history
  await tx.storesHistory.create({
    data: {
      storeId: store.id,
      changeType: "sales",
      quantity: 1,
      newStock: newQuantity,
      reason: `Order size ${matchedSizeKey}`,
      partnerId: store.userId,
      customerId: customerId,
      orderId: orderId,
    },
  });
};

export const getAllOrders = async (req: Request, res: Response) => {
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

    // 🔹 OrderStatus filter
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
              telefonnummer: true,
              wohnort: true,
              customerNumber: true,
            },
          },
          product: true,
          werkstattzettel: {
            select: {
              id: true,
              auftragsDatum: true,
              fertigstellungBis: true,
              versorgung: true,
              bezahlt: true,
            },
          },
        },
      }),
      prisma.customerOrders.count({ where }),
    ]);

    // Format invoices
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

// export const getAllOrders = async (req: Request, res: Response) => {
//   try {
//     const page = parseInt(req.query.page as string) || 1;
//     const limit = parseInt(req.query.limit as string) || 10;
//     const days = parseInt(req.query.days as string);
//     const skip = (page - 1) * limit;

//     const where: any = {};

//     // Add date filter based on days parameter
//     if (days && !isNaN(days)) {
//       const startDate = new Date();
//       startDate.setDate(startDate.getDate() - days);
//       where.createdAt = {
//         gte: startDate,
//       };
//     }

//     if (req.query.customerId) {
//       where.customerId = req.query.customerId as string;
//     }

//     if (req.query.partnerId) {
//       where.partnerId = req.query.partnerId as string;
//     }

//     if (req.query.orderStatus) {
//       where.orderStatus = req.query.orderStatus as string;
//     }

//     const [orders, totalCount] = await Promise.all([
//       prisma.customerOrders.findMany({
//         where,
//         skip,
//         take: limit,
//         orderBy: { createdAt: "desc" },
//         select: {
//           id: true,
//           fußanalyse: true,
//           einlagenversorgung: true,
//           totalPrice: true,
//           orderStatus: true,
//           statusUpdate: true,
//           invoice: true,
//           createdAt: true,
//           updatedAt: true,
//           customer: {
//             select: {
//               id: true,
//               vorname: true,
//               nachname: true,
//               email: true,
//               telefonnummer: true,
//               wohnort: true,
//               customerNumber: true,
//             },
//           },
//           product: true,
//         },
//       }),
//       prisma.customerOrders.count({ where }),
//     ]);

//     // Format orders with invoice URL
//     const formattedOrders = orders.map((order) => ({
//       ...order,
//       invoice: order.invoice ? getImageUrl(`/uploads/${order.invoice}`) : null,
//     }));

//     const totalPages = Math.ceil(totalCount / limit);
//     const hasNextPage = page < totalPages;
//     const hasPrevPage = page > 1;

//     res.status(200).json({
//       success: true,
//       message: "Orders fetched successfully",
//       data: formattedOrders,
//       pagination: {
//         totalItems: totalCount,
//         totalPages,
//         currentPage: page,
//         itemsPerPage: limit,
//         hasNextPage,
//         hasPrevPage,
//         filter: days ? `Last ${days} days` : "All time",
//       },
//     });
//   } catch (error: any) {
//     console.error("Get All Orders Error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Something went wrong",
//       error: error.message,
//     });
//   }
// };

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const order = (await prisma.customerOrders.findUnique({
      where: { id },
      include: {
        werkstattzettel: true,
        customer: {
          select: {
            id: true,
            customerNumber: true,
            vorname: true,
            nachname: true,
            email: true,
            telefonnummer: true,
            wohnort: true,
            fusslange1: true,
            fusslange2: true,
            gender: true,
            geburtsdatum: true,

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

      // Return the larger value
      return Math.max(fusslange1, fusslange2);
    };

    const findNearestSize = (
      value: number | null
    ): { size: string | null; value: number | null } => {
      if (value === null || !order.product?.langenempfehlung) {
        return { size: null, value: null };
      }

      const langenempfehlung = order.product.langenempfehlung;
      let nearestSize = null;
      let nearestValue = null;
      let smallestDifference = Infinity;

      for (const [size, sizeValue] of Object.entries(langenempfehlung)) {
        const numericValue = Number(sizeValue);
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
    const nearestSize = findNearestSize(largerFusslange);

    const formattedOrder = {
      ...order,
      invoice: order.invoice ? getImageUrl(`/uploads/${order.invoice}`) : null,
      customer: order.customer
        ? {
            ...order.customer,
            // Keep original values
            fusslange1: order.customer.fusslange1,
            fusslange2: order.customer.fusslange2,
            // Add calculated values
            largerFusslange, // This is the larger value after adding 5
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
        where: { customerId },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
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
      prisma.customerOrders.count({ where: { customerId } }),
    ]);

    const formattedOrders = orders.map((order) => ({
      ...order,
      invoice: order.invoice ? getImageUrl(`/uploads/${order.invoice}`) : null,
      // partner: order.partner ? {
      //   ...order.partner,
      //   image: order.partner.image ? getImageUrl(`/uploads/${order.partner.image}`) : null
      // } : null
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

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;

    if (!orderStatus) {
      return res.status(400).json({
        success: false,
        message: "Order status is required",
      });
    }

    const validOrderStatuses = new Set([
      "Einlage_vorbereiten",
      "Einlage_in_Fertigung",
      "Einlage_verpacken",
      "Einlage_Abholbereit",
      "Einlage_versandt",
      "Ausgeführte_Einlagen",
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
        orderStatus,
        statusUpdate: new Date(),
      },
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
        // partner: {
        //   select: {
        //     id: true,
        //     name: true,
        //     email: true,
        //     image: true,
        //     role: true,
        //   },
        // },
        product: true,
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
      message: "Order status updated successfully",
      data: formattedOrder,
    });
  } catch (error: any) {
    console.error("Update Order Status Error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
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
            telefonnummer: true,
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

    // Optionally email invoice to the customer
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
            telefonnummer: true,
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
            telefonnummer: true,
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

// export const deleteOrder = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;
//     console.log(id)

//     const order = await prisma.customerOrders.findUnique({
//       where: { id },
//       include: {
//         product: true,
//       },
//     });

//     console.log(order)

//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: "Order not found",
//       });
//     }

//     if (order.invoice) {
//       const invoicePath = path.join(process.cwd(), "uploads", order.invoice);
//       if (fs.existsSync(invoicePath)) {
//         try {
//           fs.unlinkSync(invoicePath);
//           console.log(`Deleted invoice file: ${invoicePath}`);
//         } catch (err) {
//           console.error(`Failed to delete invoice file: ${invoicePath}`, err);
//         }
//       }
//     }

//     // await prisma.$transaction(async (tx) => {
//     //   await tx.customerHistorie.deleteMany({
//     //     where: {
//     //       eventId: id,
//     //       category: "Bestellungen",
//     //     },
//     //   });
//     //   await tx.customerOrders.delete({
//     //     where: { id },
//     //   });
//     // });

//     res.status(200).json({
//       success: true,
//       message: "Order deleted successfully",
//     });
//   } catch (error: any) {
//     console.error("Delete Order Error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Something went wrong",
//       error: error.message,
//     });
//   }
// };

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

// export const getLast40DaysOrderStats = async (req: Request, res: Response) => {
//   try {
//     // today
//     const today = new Date();

//     // start: 70 days ago
//     const seventyDaysAgo = new Date();
//     seventyDaysAgo.setDate(today.getDate() - 70);

//     // end: 40 days ago
//     const fortyDaysAgo = new Date();
//     fortyDaysAgo.setDate(today.getDate() - 40);

//     const { status, includeAll } = req.query;
//     let statusFilter: any = {};

//     if (status && typeof status === "string") {
//       statusFilter.orderStatus = status;
//     } else if (includeAll === "false") {
//       statusFilter.orderStatus = {
//         in: ["Ausgeführte_Einlagen", "Einlage_versandt", "Einlage_Abholbereit"],
//       };
//     }

//     // 🧾 Fetch orders from 70–40 days ago
//     const allOrders = await prisma.customerOrders.findMany({
//       where: {
//         createdAt: {
//           gte: seventyDaysAgo,
//           lt: fortyDaysAgo,
//         },
//         ...statusFilter,
//       },
//       select: {
//         totalPrice: true,
//         createdAt: true,
//       },
//     });

//     // 📅 Generate date range (previous 30 days window)
//     const dateRange = Array.from({ length: 30 }, (_, i) => {
//       const date = new Date();
//       date.setDate(date.getDate() - (70 - i)); // 70 → 41 days ago
//       return date.toISOString().split("T")[0];
//     });

//     const revenueMap = new Map();

//     allOrders.forEach((order) => {
//       const dateKey = order.createdAt.toISOString().split("T")[0];
//       const existing = revenueMap.get(dateKey) || { revenue: 0, count: 0 };
//       revenueMap.set(dateKey, {
//         revenue: existing.revenue + (order.totalPrice || 0),
//         count: existing.count + 1,
//       });
//     });

//     const chartData = dateRange.map((dateKey) => {
//       const dayData = revenueMap.get(dateKey) || { revenue: 0, count: 0 };
//       return {
//         date: formatChartDate(dateKey),
//         value: Math.round(dayData.revenue),
//       };
//     });

//     // 📊 Compute totals and averages
//     let totalRevenue = 0;
//     let maxRevenue = 0;
//     let minRevenue = Infinity;
//     let totalOrders = 0;

//     for (const dayData of revenueMap.values()) {
//       const revenue = dayData.revenue;
//       totalRevenue += revenue;
//       totalOrders += dayData.count;
//       if (revenue > maxRevenue) maxRevenue = revenue;
//       if (revenue < minRevenue) minRevenue = revenue;
//     }

//     if (minRevenue === Infinity) minRevenue = 0;

//     const averageDailyRevenue = Math.round(totalRevenue / 30);
//     const maxRevenueDay =
//       chartData.find((day) => Math.round(maxRevenue) === day.value) ||
//       chartData[0];
//     const minRevenueDay =
//       chartData.find((day) => Math.round(minRevenue) === day.value) ||
//       chartData[0];

//     res.status(200).json({
//       success: true,
//       message: "Previous 30 days order statistics fetched successfully",
//       data: {
//         chartData,
//         statistics: {
//           totalRevenue: Math.round(totalRevenue),
//           averageDailyRevenue,
//           maxRevenueDay,
//           minRevenueDay,
//           totalOrders,
//         },
//       },
//     });
//   } catch (error: any) {
//     console.error("Get Previous 30 Days Stats Error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Something went wrong",
//       error: error.message,
//     });
//   }
// };

export const getLast40DaysOrderStats = async (req: Request, res: Response) => {
  try {
    let { year, month, status, includeAll } = req.query;

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
        in: ["Ausgeführte_Einlagen", "Einlage_versandt", "Einlage_Abholbereit"],
      };
    }

    const allOrders = await prisma.customerOrders.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        ...statusFilter,
      },
      select: {
        totalPrice: true,
        createdAt: true,
      },
    });

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

export const createWerkstattzettel = async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params;

    console.log("Received customerId:", customerId);

    if (!customerId) {
      return res.status(400).json({
        success: false,
        message: "Customer ID is required in URL parameters",
      });
    }

    const {
      kundenName,
      auftragsDatum,
      wohnort,
      telefon,
      email,
      geschaeftsstandort,
      mitarbeiter,
      fertigstellungBis,
      versorgung,
      bezahlt,
      fussanalysePreis,
      einlagenversorgungPreis,
      // orderId
    } = req.body;

    const requiredFields = [
      "kundenName",
      "auftragsDatum",
      "wohnort",
      "telefon",
      "email",
      "geschaeftsstandort",
      "mitarbeiter",
      "fertigstellungBis",
      "versorgung",
    ];

    const missingField = requiredFields.find((field) => !req.body[field]);
    if (missingField) {
      return res.status(400).json({
        success: false,
        message: `${missingField} is required`,
      });
    }

    const customer = await prisma.customers.findUnique({
      where: { id: customerId },
      select: { id: true, vorname: true, nachname: true },
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const werkstattzettel = await prisma.werkstattzettel.upsert({
      where: { customerId },
      update: {
        kundenName,
        auftragsDatum: new Date(auftragsDatum),
        wohnort,
        telefon,
        email,
        geschaeftsstandort: Array.isArray(geschaeftsstandort)
          ? geschaeftsstandort.join(", ")
          : geschaeftsstandort,
        mitarbeiter,
        fertigstellungBis: fertigstellungBis
          ? new Date(fertigstellungBis)
          : null,
        versorgung,
        bezahlt: Boolean(bezahlt),
        fussanalysePreis: fussanalysePreis
          ? parseFloat(fussanalysePreis)
          : null,
        einlagenversorgungPreis: einlagenversorgungPreis
          ? parseFloat(einlagenversorgungPreis)
          : null,
      },
      create: {
        kundenName,
        auftragsDatum: new Date(auftragsDatum),
        wohnort,
        telefon,
        email,
        geschaeftsstandort: Array.isArray(geschaeftsstandort)
          ? geschaeftsstandort.join(", ")
          : geschaeftsstandort,
        mitarbeiter,
        fertigstellungBis: fertigstellungBis
          ? new Date(fertigstellungBis)
          : null,
        versorgung,
        bezahlt: Boolean(bezahlt),
        fussanalysePreis: fussanalysePreis
          ? parseFloat(fussanalysePreis)
          : null,
        einlagenversorgungPreis: einlagenversorgungPreis
          ? parseFloat(einlagenversorgungPreis)
          : null,
        customerId,
      },
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
      },
    });

    // // If orderId is provided, link the order to this Werkstattzettel
    // if (orderId) {
    //   // Check if order exists and belongs to this customer
    //   const order = await prisma.customerOrders.findFirst({
    //     where: {
    //       id: orderId,
    //       customerId: customerId
    //     }
    //   });

    //   if (order) {
    //     await prisma.customerOrders.update({
    //       where: { id: orderId },
    //       data: {
    //         werkstattzettelId: werkstattzettel.id
    //       }
    //     });

    //     // Update history for the order link
    //     await prisma.customerHistorie.create({
    //       data: {
    //         customerId,
    //         category: "Bestellungen",
    //         date: new Date(),
    //         note: `Werkstattzettel linked to order ${orderId}`,
    //         system_note: `Werkstattzettel ${werkstattzettel.id} linked to order ${orderId}`,
    //         eventId: orderId
    //       }
    //     });
    //   }
    // }

    res.status(201).json({
      success: true,
      message: "Werkstattzettel created successfully",
      data: werkstattzettel,
    });
  } catch (error: any) {
    console.error("Create Werkstattzettel Error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

export const getEinlagenInProduktion = async (req: Request, res: Response) => {
  try {
    const count = await prisma.customerOrders.count({
      where: {
        orderStatus: {
          in: [
            "Einlage_vorbereiten",
            "Einlage_in_Fertigung",
            "Einlage_verpacken",
            "Einlage_Abholbereit",
          ],
        },
      },
    });

    res.status(200).json({
      success: true,
      data: count,
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
