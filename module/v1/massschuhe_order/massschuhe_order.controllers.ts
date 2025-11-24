import { Prisma } from "@prisma/client";
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// const extractLengthValue = (value: any): number | null => {
//   if (value === null || value === undefined) {
//     return null;
//   }

//   if (typeof value === "object" && !Array.isArray(value)) {
//     if (Object.prototype.hasOwnProperty.call(value, "length")) {
//       const lengthNumber = Number((value as any).length);
//       return Number.isFinite(lengthNumber) ? lengthNumber : null;
//     }
//   }

//   const numericValue = Number(value);
//   return Number.isFinite(numericValue) ? numericValue : null;
// };

// const determineSizeFromGroessenMengen = (
//   groessenMengen: any,
//   targetLength: number
// ): string | null => {
//   if (!groessenMengen || typeof groessenMengen !== "object") {
//     return null;
//   }

//   let closestSizeKey: string | null = null;
//   let smallestDiff = Infinity;

//   for (const [sizeKey, sizeData] of Object.entries(
//     groessenMengen as Record<string, any>
//   )) {
//     const lengthValue = extractLengthValue(sizeData);
//     if (lengthValue === null) {
//       continue;
//     }
//     const diff = Math.abs(targetLength - lengthValue);
//     if (diff < smallestDiff) {
//       smallestDiff = diff;
//       closestSizeKey = sizeKey;
//     }
//   }

//   return closestSizeKey;
// };

// const determineProductSize = (
//   customer: any,
//   versorgung: any
// ): string | null => {
//   const largerFusslange = Math.max(
//     Number(customer.fusslange1) + 5,
//     Number(customer.fusslange2) + 5
//   );

//   if (
//     !versorgung.langenempfehlung ||
//     typeof versorgung.langenempfehlung !== "object"
//   ) {
//     return null;
//   }

//   let matchedSizeKey: string | null = null;
//   let smallestDiff = Infinity;

//   for (const [sizeKey, sizeData] of Object.entries(
//     versorgung.langenempfehlung as any
//   )) {
//     const lengthValue = extractLengthValue(sizeData);
//     if (lengthValue === null) {
//       continue;
//     }
//     const diff = Math.abs(largerFusslange - lengthValue);
//     if (diff < smallestDiff) {
//       smallestDiff = diff;
//       matchedSizeKey = sizeKey;
//     }
//   }

//   return matchedSizeKey;
// };

// const calculateTotalPrice = (customer: any): number => {
//   return (customer.fußanalyse || 0) + (customer.einlagenversorgung || 0);
// };

// const validateMassschuheOrderData = (
//   customer: any,
//   versorgung: any,
//   werkstattzettel: any
// ) => {
//   if (!customer || !versorgung) {
//     return {
//       success: false,
//       message: "Customer or Versorgung not found",
//       status: 404,
//     };
//   }

//   if (customer.fußanalyse == null || customer.einlagenversorgung == null) {
//     return {
//       success: false,
//       message: "fußanalyse or einlagenversorgung price is not set",
//       status: 400,
//     };
//   }

//   if (!werkstattzettel) {
//     return {
//       success: false,
//       message: "werkstattzettel id not found",
//       status: 400,
//     };
//   }

//   if (customer.fusslange1 == null || customer.fusslange2 == null) {
//     return {
//       success: false,
//       message: "Customer fusslange1 or fusslange2 not found",
//       status: 400,
//     };
//   }

//   return null;
// };

// const updateStoreStock = async (
//   tx: any,
//   params: { storeId: string; customer: any; customerId: string }
// ) => {
//   const { storeId, customer, customerId } = params;

//   const store = await tx.stores.findUnique({
//     where: { id: storeId },
//     select: { id: true, groessenMengen: true, userId: true },
//   });

//   if (
//     !store ||
//     !store.groessenMengen ||
//     typeof store.groessenMengen !== "object"
//   ) {
//     return null;
//   }

//   const sizes = { ...(store.groessenMengen as any) } as Record<string, any>;
//   const targetLength =
//     Math.max(Number(customer.fusslange1), Number(customer.fusslange2)) + 5;

//   const storeMatchedSizeKey = determineSizeFromGroessenMengen(
//     sizes,
//     targetLength
//   );

//   if (!storeMatchedSizeKey) {
//     throw new Error("NO_MATCHED_SIZE_IN_STORE");
//   }

//   const sizeValue = sizes[storeMatchedSizeKey];
//   let currentQty: number;

//   if (sizeValue && typeof sizeValue === "object" && "quantity" in sizeValue) {
//     currentQty = Number(sizeValue.quantity ?? 0);
//   } else if (typeof sizeValue === "number") {
//     currentQty = sizeValue;
//   } else {
//     currentQty = 0;
//   }

//   const newQty = Math.max(currentQty - 1, 0);

//   if (sizeValue && typeof sizeValue === "object" && "quantity" in sizeValue) {
//     sizes[storeMatchedSizeKey] = {
//       ...sizeValue,
//       quantity: newQty,
//     };
//   } else if (typeof sizeValue === "number") {
//     sizes[storeMatchedSizeKey] = newQty;
//   } else {
//     sizes[storeMatchedSizeKey] = {
//       quantity: newQty,
//     };
//   }

//   await tx.stores.update({
//     where: { id: store.id },
//     data: { groessenMengen: sizes },
//   });

//   await tx.storesHistory.create({
//     data: {
//       storeId: store.id,
//       changeType: "sales",
//       quantity: currentQty > 0 ? 1 : 0,
//       newStock: newQty,
//       reason: `Massschuhe order size ${storeMatchedSizeKey}`,
//       partnerId: store.userId,
//       customerId,
//       orderId: null,
//     },
//   });

//   return storeMatchedSizeKey;
// };

// // ausführliche_diagnose String?
// // versorgung_laut_arzt   String?
// // einlagentyp         String?
// // überzug            String?
// // menge               Int? //quantity
// // versorgung_note     String? //Hast du sonstige Anmerkungen oder Notizen zur Versorgung... ?
// // schuhmodell_wählen String? //জুতার মডেল নির্বাচন করুন ম্যানুয়ালি লিখুন (ব্র্যান্ড + মডেল + সাইজ)
// // kostenvoranschlag   Boolean? @default(false)

// export const createMassschuheOrder = async (req: Request, res: Response) => {
//   try {
//     const {
//       customerId,
//       versorgungId,
//       werkstattzettelId,
//       ausführliche_diagnose,
//       versorgung_laut_arzt,
//       einlagentyp,
//       überzug,
//       menge,
//       versorgung_note,
//       schuhmodell_wählen,
//       kostenvoranschlag,
//     } = req.body;
//     const partnerId = req.user.id;

//     const missingField = [
//       "customerId",
//       "versorgungId",
//       "werkstattzettelId",
//     ].find((field) => !req.body[field]);

//     if (missingField) {
//       return res
//         .status(400)
//         .json({ success: false, message: `${missingField} is required!` });
//     }

//     const [customer, versorgung, werkstattzettel] = await Promise.all([
//       prisma.customers.findUnique({
//         where: { id: customerId },
//         select: {
//           fußanalyse: true,
//           einlagenversorgung: true,
//           fusslange1: true,
//           fusslange2: true,
//         },
//       }),
//       prisma.versorgungen.findUnique({
//         where: { id: versorgungId },
//         select: {
//           name: true,
//           rohlingHersteller: true,
//           artikelHersteller: true,
//           versorgung: true,
//           material: true,
//           langenempfehlung: true,
//           status: true,
//           diagnosis_status: true,
//           storeId: true,
//         },
//       }),
//       prisma.werkstattzettel.findUnique({
//         where: { id: werkstattzettelId },
//       }),
//     ]);

//     const validationError = validateMassschuheOrderData(
//       customer,
//       versorgung,
//       werkstattzettel
//     );

//     if (validationError) {
//       return res
//         .status(validationError.status)
//         .json({ success: false, message: validationError.message });
//     }

//     const customerData = customer as NonNullable<typeof customer>;
//     const versorgungData = versorgung as NonNullable<typeof versorgung>;

//     let matchedSizeKey: string | null = determineProductSize(
//       customerData,
//       versorgungData
//     );
//     const totalPrice = calculateTotalPrice(customerData);

//     const order = await prisma.$transaction(async (tx) => {
//       const newOrder = await tx.massschuhe_order.create({
//         data: {
//           customerId,
//           partnerId,
//           versorgungenId: versorgungId,
//           werkstattzettelId,
//           fußanalyse: customerData.fußanalyse,
//           einlagenversorgung: customerData.einlagenversorgung,
//           totalPrice,
//           ausführliche_diagnose,
//           versorgung_laut_arzt,
//           einlagentyp,
//           überzug,
//           menge,
//           versorgung_note,
//           schuhmodell_wählen,
//           kostenvoranschlag,
//         },
//         select: { id: true },
//       });

//       if (versorgungData.storeId) {
//         const storeMatchedSizeKey = await updateStoreStock(tx, {
//           storeId: versorgungData.storeId,
//           customer: customerData,
//           customerId,
//         });

//         if (storeMatchedSizeKey) {
//           matchedSizeKey = storeMatchedSizeKey;
//         }
//       }

//       await tx.customerHistorie.create({
//         data: {
//           customerId,
//           category: "Bestellungen",
//           eventId: newOrder.id,
//           note: "New massschuhe order created",
//           system_note: "New massschuhe order created",
//           paymentIs: totalPrice.toString(),
//         },
//       });

//       return { ...newOrder, matchedSizeKey };
//     });

//     return res.status(201).json({
//       success: true,
//       message: "Massschuhe order created successfully",
//       orderId: order.id,
//       matchedSize: order.matchedSizeKey,
//     });
//   } catch (error: any) {
//     if (error?.message === "NO_MATCHED_SIZE_IN_STORE") {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Unable to determine nearest size from groessenMengen for this store",
//       });
//     }

//     console.error("Create Massschuhe Order Error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Something went wrong while creating Massschuhe Order",
//       error: error.message,
//     });
//   }
// };

// export const getAllMassschuheOrders = async (req: Request, res: Response) => {
//   try {
//     const page = parseInt(req.query.page as string) || 1;
//     const limit = parseInt(req.query.limit as string) || 10;
//     const days = parseInt(req.query.days as string);
//     const skip = (page - 1) * limit;

//     const where: any = {};

//     if (days && !isNaN(days)) {
//       const startDate = new Date();
//       startDate.setDate(startDate.getDate() - days);
//       where.createdAt = { gte: startDate };
//     }

//     if (req.query.customerId) {
//       where.customerId = req.query.customerId as string;
//     }

//     if (req.query.partnerId) {
//       where.partnerId = req.query.partnerId as string;
//     }

//     const [orders, totalCount] = await Promise.all([
//       prisma.massschuhe_order.findMany({
//         where,
//         skip,
//         take: limit,
//         orderBy: { createdAt: "desc" },

//         include: {
//           customer: {
//             select: {
//               id: true,
//               customerNumber: true,
//               vorname: true,
//               nachname: true,
//               email: true,
//               telefonnummer: true,
//               wohnort: true,
//             },
//           },
//           user: {
//             select: {
//               id: true,
//               name: true,
//               email: true,
//               role: true,
//               phone: true,
//             },
//           },
//           versorgungen: {
//             select: {
//               id: true,
//               name: true,
//               rohlingHersteller: true,
//               artikelHersteller: true,
//               versorgung: true,
//               material: true,
//               diagnosis_status: true,
//               status: true,
//             },
//           },
//           werkstattzettel: {
//             select: {
//               id: true,
//               auftragsDatum: true,
//               fertigstellungBis: true,
//               versorgung: true,
//               bezahlt: true,
//             },
//           },
//         },
//       }),

//       prisma.massschuhe_order.count({ where }),
//     ]);

//     const formattedOrders = orders.map(({ user, ...rest }) => ({
//       ...rest,
//       partner: user || null,
//     }));

//     const totalPages = Math.ceil(totalCount / limit);

//     res.status(200).json({
//       success: true,
//       message: "Massschuhe orders fetched successfully",
//       data: formattedOrders,
//       pagination: {
//         totalItems: totalCount,
//         totalPages,
//         currentPage: page,
//         itemsPerPage: limit,
//         hasNextPage: page < totalPages,
//         hasPrevPage: page > 1,
//         filter: days ? `Last ${days} days` : "All time",
//       },
//     });
//   } catch (error: any) {
//     console.error("Get All Massschuhe Orders Error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Something went wrong while fetching massschuhe orders",
//       error: error.message,
//     });
//   }
// };

// export const getMassschuheOrderById = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;

//     //i need to get all data of customer_order table plus relations
//     const order = (await prisma.massschuhe_order.findUnique({
//       where: { id },
//       include: {
//         werkstattzettel: true,
//         customer: {
//           select: {
//             id: true,
//             customerNumber: true,
//             vorname: true,
//             nachname: true,
//             email: true,
//             telefonnummer: true,
//             wohnort: true,
//             fusslange1: true,
//             fusslange2: true,
//           },
//         },
//         user: {
//           select: {
//             id: true,
//             name: true,
//             email: true,
//             role: true,
//             phone: true,
//           },
//         },
//         versorgungen: true,
//       },
//     })) as any;

//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: "Massschuhe order not found",
//       });
//     }

//     const largerFusslange =
//       order.customer?.fusslange1 == null || order.customer?.fusslange2 == null
//         ? null
//         : Math.max(
//             Number(order.customer.fusslange1) + 5,
//             Number(order.customer.fusslange2) + 5
//           );

//     const recommendedSize =
//       order.customer && order.versorgungen
//         ? determineProductSize(order.customer, order.versorgungen)
//         : null;

//     const formattedOrder = {
//       ...order,
//       partner: order.user || null,
//       customer: order.customer
//         ? {
//             ...order.customer,
//             largerFusslange,
//             recommendedSize,
//           }
//         : null,
//     };

//     res.status(200).json({
//       success: true,
//       message: "Massschuhe order fetched successfully",
//       data: formattedOrder,
//     });
//   } catch (error: any) {
//     console.error("Get Massschuhe Order By ID Error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Something went wrong while fetching massschuhe order",
//       error: error.message,
//     });
//   }
// };

// export const deleteMassschuheOrder = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;

//     const existingOrder = await prisma.massschuhe_order.findUnique({
//       where: { id },
//       select: { id: true },
//     });

//     if (!existingOrder) {
//       return res.status(404).json({
//         success: false,
//         message: "Massschuhe order not found",
//       });
//     }

//     const deletedOrder = await prisma.massschuhe_order.delete({
//       where: { id },
//       select: { id: true },
//     });

//     return res.status(200).json({
//       success: true,
//       message: "Massschuhe order deleted successfully",
//       data: { id: deletedOrder.id },
//     });
//   } catch (error: any) {
//     console.error("Delete Massschuhe Order Error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Something went wrong while deleting massschuhe order",
//       error: error.message,
//     });
//   }
// };

// Ärztliche_diagnose   String?
// usführliche_diagnose String?
// rezeptnummer          String?
// durchgeführt_von     String?
// note                  String?

// albprobe_geplant  Boolean? @default(false)
// kostenvoranschlag Boolean? @default(false)

// //relation with users
// userId String?
// user   User?   @relation(fields: [userId], references: [id], onDelete: SetNull)

export const createMassschuheOrder = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const {
      employeeId,
      customerId,
      arztliche_diagnose,
      usführliche_diagnose,
      rezeptnummer,
      durchgeführt_von,
      note,
      albprobe_geplant,
      kostenvoranschlag,
    } = req.body;

    const missingField = [
      "employeeId",
      "customerId",
      "arztliche_diagnose",
      "usführliche_diagnose",
      "rezeptnummer",
      "durchgeführt_von",
      "note",
    ].find((field) => !req.body[field]);

    if (missingField) {
      return res.status(400).json({
        success: false,
        message: `${missingField} is required!`,
      });
    }

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

    const employee = await prisma.employees.findUnique({
      where: { id: employeeId },
      select: { id: true },
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // Convert boolean fields - handle string "true"/"false" or actual booleans
    const convertToBoolean = (value: any): boolean | null => {
      if (value === null || value === undefined) {
        return null;
      }
      if (typeof value === "boolean") {
        return value;
      }
      if (typeof value === "string") {
        const lower = value.toLowerCase().trim();
        if (lower === "true" || lower === "1" || lower === "yes") {
          return true;
        }
        if (
          lower === "false" ||
          lower === "0" ||
          lower === "no" ||
          lower === ""
        ) {
          return false;
        }
        // If it's a non-empty string that doesn't match boolean patterns, treat as false
        return false;
      }
      // For numbers, treat 0/1 as boolean
      if (typeof value === "number") {
        return value !== 0;
      }
      return false;
    };

    const createData = {
      arztliche_diagnose,
      usführliche_diagnose,
      rezeptnummer,
      durchgeführt_von,
      note,
      albprobe_geplant: convertToBoolean(albprobe_geplant),
      kostenvoranschlag: convertToBoolean(kostenvoranschlag),
      userId,
      employeeId,
      customerId,
    } as Prisma.massschuhe_orderUncheckedCreateInput;

    const massschuheOrder = await prisma.massschuhe_order.create({
      data: createData,
    });

    return res.status(201).json({
      success: true,
      message: "Massschuhe order created successfully",
      data: massschuheOrder,
    });
  } catch (error: any) {
    console.error("Create Massschuhe Order Error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong while creating massschuhe order",
      error: error.message,
    });
  }
};

export const getMassschuheOrder = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;

    // Parse pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const search = (req.query.search as string)?.trim() || "";

    // Build where clause
    const where: any = {
      userId,
    };

    // Add search functionality - search across multiple fields
    if (search) {
      where.AND = [
        {
          OR: [
            { arztliche_diagnose: { contains: search, mode: "insensitive" } },
            { usführliche_diagnose: { contains: search, mode: "insensitive" } },
            { rezeptnummer: { contains: search, mode: "insensitive" } },
            { durchgeführt_von: { contains: search, mode: "insensitive" } },
            { note: { contains: search, mode: "insensitive" } },
          ],
        },
      ];
    }

    // Get total count and orders in parallel
    const [totalItems, massschuheOrders] = await Promise.all([
      prisma.massschuhe_order.count({ where }),
      prisma.massschuhe_order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        // include: {
        //   user: {
        //     select: {
        //       id: true,
        //       name: true,
        //       email: true,
        //       role: true,
        //       phone: true,
        //     },
        //   },
        // },
      }),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalItems / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Format response
    // const formattedOrders = massschuheOrders.map(({ user, ...rest }) => ({
    //   ...rest,
    //   partner: user || null,
    // }));

    return res.status(200).json({
      success: true,
      message: search
        ? `Found ${totalItems} order(s) matching "${search}"`
        : "Massschuhe orders fetched successfully",
      data: massschuheOrders,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        itemsPerPage: limit,
        hasNextPage,
        hasPrevPage,
        ...(search && { search }),
      },
    });
  } catch (error: any) {
    console.error("Get Massschuhe Order Error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong while fetching massschuhe order",
      error: error.message,
    });
  }
};

export const updateMassschuheOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const {
      employeeId,
      customerId,
      arztliche_diagnose,
      usführliche_diagnose,
      rezeptnummer,
      durchgeführt_von,
      note,
      albprobe_geplant,
      kostenvoranschlag,
    } = req.body;

    // Check if order exists and belongs to the user
    const existingOrder = await prisma.massschuhe_order.findUnique({
      where: { id },
      select: { id: true, userId: true },
    });

    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        message: "Massschuhe order not found",
      });
    }

    // Verify ownership
    if (existingOrder.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to update this order",
      });
    }

    // Convert boolean fields - handle string "true"/"false" or actual booleans
    const convertToBoolean = (value: any): boolean | null => {
      if (value === null || value === undefined) {
        return undefined; // Don't update if not provided
      }
      if (typeof value === "boolean") {
        return value;
      }
      if (typeof value === "string") {
        const lower = value.toLowerCase().trim();
        if (lower === "true" || lower === "1" || lower === "yes") {
          return true;
        }
        if (
          lower === "false" ||
          lower === "0" ||
          lower === "no" ||
          lower === ""
        ) {
          return false;
        }
        // If it's a non-empty string that doesn't match boolean patterns, treat as false
        return false;
      }
      // For numbers, treat 0/1 as boolean
      if (typeof value === "number") {
        return value !== 0;
      }
      return false;
    };

    // Build update data - only include fields that are provided
    const updateData: any = {};

    if (arztliche_diagnose !== undefined)
      updateData.arztliche_diagnose = arztliche_diagnose;
    if (usführliche_diagnose !== undefined)
      updateData.usführliche_diagnose = usführliche_diagnose;
    if (rezeptnummer !== undefined) updateData.rezeptnummer = rezeptnummer;
    if (durchgeführt_von !== undefined)
      updateData.durchgeführt_von = durchgeführt_von;
    if (note !== undefined) updateData.note = note;
    if (albprobe_geplant !== undefined)
      updateData.albprobe_geplant = convertToBoolean(albprobe_geplant);
    if (kostenvoranschlag !== undefined)
      updateData.kostenvoranschlag = convertToBoolean(kostenvoranschlag);

    if (customerId !== undefined) {
      if (!customerId) {
        return res.status(400).json({
          success: false,
          message: "customerId cannot be empty",
        });
      }

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

      updateData.customerId = customerId;
    }

    if (employeeId !== undefined) {
      if (!employeeId) {
        return res.status(400).json({
          success: false,
          message: "employeeId cannot be empty",
        });
      }

      const employee = await prisma.employees.findUnique({
        where: { id: employeeId },
        select: { id: true },
      });

      if (!employee) {
        return res.status(404).json({
          success: false,
          message: "Employee not found",
        });
      }

      updateData.employeeId = employeeId;
    }

    const updatedOrder = await prisma.massschuhe_order.update({
      where: { id },
      data: updateData,
    });

    return res.status(200).json({
      success: true,
      message: "Massschuhe order updated successfully",
      data: updatedOrder,
    });
  } catch (error: any) {
    console.error("Update Massschuhe Order Error:", error);

    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Massschuhe order not found",
      });
    }

    res.status(500).json({
      success: false,
      message: "Something went wrong while updating massschuhe order",
      error: error.message,
    });
  }
};

export const deleteMassschuheOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if order exists and belongs to the user
    const existingOrder = await prisma.massschuhe_order.findUnique({
      where: { id },
      select: { id: true, userId: true },
    });

    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        message: "Massschuhe order not found",
      });
    }

    // Verify ownership
    if (existingOrder.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to delete this order",
      });
    }

    await prisma.massschuhe_order.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: "Massschuhe order deleted successfully",
      data: { id: existingOrder.id },
    });
  } catch (error: any) {
    console.error("Delete Massschuhe Order Error:", error);

    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Massschuhe order not found",
      });
    }

    res.status(500).json({
      success: false,
      message: "Something went wrong while deleting massschuhe order",
      error: error.message,
    });
  }
};

export const getMassschuheOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const massschuheOrder = await prisma.massschuhe_order.findUnique({
      where: { id },
    });
    if (!massschuheOrder) {
      return res.status(404).json({
        success: false,
        message: "Massschuhe order not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Massschuhe order fetched successfully",
      data: massschuheOrder,
    });
  } catch (error: any) {
    console.error("Get Massschuhe Order By Id Error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong while fetching massschuhe order by id",
      error: error.message,
    });
  }
};
