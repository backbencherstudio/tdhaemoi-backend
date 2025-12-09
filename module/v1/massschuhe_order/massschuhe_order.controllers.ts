import { Prisma, $Enums } from "@prisma/client";
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Valid statuses for massschuhe orders
const VALID_STATUSES = [
  "Leistenerstellung",
  "Bettungsherstellung",
  "Halbprobenerstellung",
  "Schafterstellung",
  "Bodenerstellung",
  "Geliefert",
] as const;

// Get next order number for a partner (starts from 1000)
const getNextOrderNumberForPartner = async (
  tx: any,
  userId: string
): Promise<number> => {
  const maxOrder = await tx.massschuhe_order.findFirst({
    where: {
      userId,
      orderNumber: { not: null }, // Filter out null orderNumbers
    },
    orderBy: { orderNumber: "desc" },
    select: { orderNumber: true },
  });
  // Always start from 1000, even if previous orders have lower numbers
  return maxOrder &&
    maxOrder.orderNumber !== null &&
    maxOrder.orderNumber >= 1000
    ? maxOrder.orderNumber + 1
    : 1000;
};

// Helper function to format date as "DD.MM.YY HH:MMAM/PM" (24-hour format with AM/PM indicator)
const formatDateTime = (date: Date | null | undefined): string | null => {
  if (!date) return null;

  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const year = d.getFullYear().toString().slice(-2);

  const hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours.toString().padStart(2, "0");

  return `${day}.${month}.${year} ${formattedHours}:${minutes}${ampm}`;
};

// Helper function to format order with status history
const formatOrderWithStatusHistory = (order: any) => {
  // Group history by statusTo to get Started/Finished for each status
  const statusHistoryMap = new Map();

  order.massschuheOrderHistories?.forEach((history: any) => {
    const status = history.statusTo;
    if (!statusHistoryMap.has(status)) {
      statusHistoryMap.set(status, {
        status,
        startedAt: history.startedAt,
        finishedAt: history.finishedAt,
        started: formatDateTime(history.startedAt),
        finished: formatDateTime(history.finishedAt),
      });
    } else {
      // If multiple entries for same status, use the earliest startedAt and latest finishedAt
      const existing = statusHistoryMap.get(status);
      if (
        history.startedAt &&
        (!existing.startedAt || history.startedAt < existing.startedAt)
      ) {
        existing.startedAt = history.startedAt;
        existing.started = formatDateTime(history.startedAt);
      }
      if (
        history.finishedAt &&
        (!existing.finishedAt || history.finishedAt > existing.finishedAt)
      ) {
        existing.finishedAt = history.finishedAt;
        existing.finished = formatDateTime(history.finishedAt);
      }
    }
  });

  // Convert map to array and sort by status order
  const statusOrder = [
    "Leistenerstellung",
    "Bettungsherstellung",
    "Halbprobenerstellung",
    "Schafterstellung",
    "Bodenerstellung",
    "Geliefert",
  ];

  const statusHistory = Array.from(statusHistoryMap.values()).sort((a, b) => {
    const indexA = statusOrder.indexOf(a.status);
    const indexB = statusOrder.indexOf(b.status);
    return indexA - indexB;
  });

  // Remove massschuheOrderHistories from the response
  const { massschuheOrderHistories, ...orderWithoutHistory } = order;

  return {
    ...orderWithoutHistory,
    statusHistory,
  };
};

// model massschuhe_order {
//   id String @id @default(uuid())

//   arztliche_diagnose    String?
//   usführliche_diagnose String?
//   rezeptnummer          String?
//   durchgeführt_von     String?
//   note                  String?

//   albprobe_geplant   Boolean?                @default(false)
//   kostenvoranschlag  Boolean?                @default(false)
//   //-------------------------------------------------
//   //workload section
//   delivery_date      String?
//   telefon            String?
//   filiale            String? //location
//   kunde              String? //customer name
//   email              String?
//   button_text        String?
//   // PREISAUSWAHL
//   fußanalyse        Float?
//   einlagenversorgung Float?
//   customer_note      String?
//   location           String?
//   //-------------------------------------------------
//   status             massschuhe_order_status @default(Leistenerstellung)

//   //-------------------------------------------------

//   //relation with users
//   userId String?
//   user   User?   @relation(fields: [userId], references: [id], onDelete: SetNull)

//   employeeId String?
//   employee   Employees? @relation(fields: [employeeId], references: [id], onDelete: SetNull)

//   customerId String?
//   customer   customers? @relation(fields: [customerId], references: [id], onDelete: SetNull)

//   createdAt                DateTime                   @default(now())
//   updatedAt                DateTime                   @updatedAt
//   massschuheOrderHistories massschuhe_order_history[]

//   @@index([createdAt])
//   @@index([updatedAt])
// }

// enum massschuhe_order_status {
//   Leistenerstellung //started

//   Bettungsherstellung
//   Halbprobenerstellung
//   Schafterstellung
//   Bodenerstellung

//   Geliefert //delivered
// }

// //as like as customer order history
// model massschuhe_order_history {
//   id String @id @default(uuid())

//   statusFrom OrderStatus
//   statusTo   OrderStatus
//   note       String?

//   //relation
//   massschuhe_orderId String
//   massschuhe_order   massschuhe_order @relation(fields: [massschuhe_orderId], references: [id], onDelete: Cascade)

//   partnerId String?
//   partner   User?   @relation(fields: [partnerId], references: [id], onDelete: SetNull)

//   employeeId String?
//   employee   Employees? @relation(fields: [employeeId], references: [id], onDelete: SetNull)

//   customerId String?
//   customer   customers? @relation(fields: [customerId], references: [id], onDelete: SetNull)

//   createdAt DateTime @default(now())
//   updatedAt DateTime @updatedAt

//   @@index([createdAt])
//   @@index([massschuhe_orderId])
//   @@index([partnerId])
//   @@index([employeeId])
//   @@index([customerId])
// }

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

      delivery_date,
      telefon,
      filiale,
      kunde,
      email,
      button_text,
      fußanalyse,
      einlagenversorgung,
      customer_note,
      location,
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

    // Use transaction with retry logic to handle race conditions
    let retries = 3;
    let result;

    while (retries > 0) {
      try {
        result = await prisma.$transaction(async (tx) => {
          // Get next order number for this partner
          const orderNumber = await getNextOrderNumberForPartner(tx, userId);

          const createData = {
            orderNumber,
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

            delivery_date,
            telefon,
            filiale,
            kunde,
            email,
            button_text,
            fußanalyse,
            einlagenversorgung,
            customer_note,
            location,
          } as Prisma.massschuhe_orderUncheckedCreateInput;

          const massschuheOrder = await tx.massschuhe_order.create({
            data: createData,
          });

          await tx.customerHistorie.create({
            data: {
              customerId,
              category: "Bestellungen",
              note: "Massschuhe order created",
              eventId: massschuheOrder.id,
              system_note: "Massschuhe order created",
            },
          });

          // Create initial order history entry (UTC)
          await tx.massschuhe_order_history.create({
            data: {
              massschuhe_orderId: massschuheOrder.id,
              statusFrom: null,
              statusTo: massschuheOrder.status,
              partnerId: userId,
              employeeId: employeeId || null,
              customerId: customerId || null,
              note: "Order created",
              startedAt: new Date(), // UTC by default in JS
            },
          });

          return massschuheOrder;
        });
        break; // Success, exit retry loop
      } catch (error: any) {
        // Check if it's a unique constraint violation on orderNumber
        if (
          error.code === "P2002" &&
          error.meta?.target?.includes("orderNumber") &&
          retries > 1
        ) {
          retries--;
          // Wait a bit before retrying (exponential backoff)
          await new Promise((resolve) =>
            setTimeout(resolve, 100 * (4 - retries))
          );
          continue;
        }
        throw error; // Re-throw if not a retryable error or out of retries
      }
    }

    if (!result) {
      throw new Error("Failed to create order after retries");
    }

    const massschuheOrder = result;

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

    // Add status filter
    if (req.query.status) {
      const status = req.query.status as string;

      // Validate status
      if (!VALID_STATUSES.includes(status as any)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status: "${status}"`,
          validStatuses: VALID_STATUSES,
          suggestion: `Did you mean one of these? ${VALID_STATUSES.join(", ")}`,
        });
      }

      where.status = status;
    }

    // Add search functionality - search across multiple fields
    if (search) {
      const searchConditions = {
        OR: [
          { arztliche_diagnose: { contains: search, mode: "insensitive" } },
          { usführliche_diagnose: { contains: search, mode: "insensitive" } },
          { rezeptnummer: { contains: search, mode: "insensitive" } },
          { durchgeführt_von: { contains: search, mode: "insensitive" } },
          { note: { contains: search, mode: "insensitive" } },
        ],
      };

      // If status filter exists, combine with AND
      if (where.status) {
        where.AND = [searchConditions];
      } else {
        where.AND = [searchConditions];
      }
    }

    // Get total count and orders in parallel
    const [totalItems, massschuheOrders] = await Promise.all([
      prisma.massschuhe_order.count({ where }),
      prisma.massschuhe_order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          massschuheOrderHistories: {
            orderBy: { startedAt: "desc" },
            select: {
              id: true,
              statusFrom: true,
              statusTo: true,
              startedAt: true,
              finishedAt: true,
              note: true,
            },
          },
        },
      }),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalItems / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Format orders with status history (Started/Finished timestamps)
    const formattedOrders = massschuheOrders.map((order) =>
      formatOrderWithStatusHistory(order)
    );

    // Build response message
    let message = "Massschuhe orders fetched successfully";
    if (req.query.status && search) {
      message = `Found ${totalItems} order(s) with status "${req.query.status}" matching "${search}"`;
    } else if (req.query.status) {
      message = `Found ${totalItems} order(s) with status "${req.query.status}"`;
    } else if (search) {
      message = `Found ${totalItems} order(s) matching "${search}"`;
    }

    return res.status(200).json({
      success: true,
      message,
      data: formattedOrders,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        itemsPerPage: limit,
        hasNextPage,
        hasPrevPage,
        ...(search && { search }),
        ...(req.query.status && { status: req.query.status }),
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

export const getMassschuheOrderByCustomerId = async (
  req: Request,
  res: Response
) => {
  try {
    const { customerId } = req.params;
    // add pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const where: any = {
      customerId,
    };

    // Add status filter
    if (req.query.status) {
      const status = req.query.status as string;

      // Validate status
      if (!VALID_STATUSES.includes(status as any)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status: "${status}"`,
          validStatuses: VALID_STATUSES,
          suggestion: `Did you mean one of these? ${VALID_STATUSES.join(", ")}`,
        });
      }

      where.status = status;
    }

    const [totalItems, massschuheOrders] = await Promise.all([
      prisma.massschuhe_order.count({ where }),
      prisma.massschuhe_order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          massschuheOrderHistories: {
            orderBy: { startedAt: "desc" },
            select: {
              id: true,
              statusFrom: true,
              statusTo: true,
              startedAt: true,
              finishedAt: true,
              note: true,
            },
          },
        },
      }),
      prisma.customers.findUnique({
        where: { id: customerId },
        select: { id: true },
      }),
    ]);
    const totalPages = Math.ceil(totalItems / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

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

    // Format orders with status history (Started/Finished timestamps)
    const formattedOrders = massschuheOrders.map((order) =>
      formatOrderWithStatusHistory(order)
    );

    // Build response message
    let message = "Massschuhe order fetched successfully";
    if (req.query.status) {
      message = `Found ${totalItems} order(s) with status "${req.query.status}"`;
    }

    return res.status(200).json({
      success: true,
      message,
      data: formattedOrders,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        itemsPerPage: limit,
        hasNextPage,
        hasPrevPage,
        ...(req.query.status && { status: req.query.status }),
      },
    });
  } catch (error) {
    console.error("Get Massschuhe Order By Customer Id Error:", error);
    res.status(500).json({
      success: false,
      message:
        "Something went wrong while fetching massschuhe order by customer id",
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

      delivery_date,
      telefon,
      filiale,
      kunde,
      email,
      button_text,
      fußanalyse,
      einlagenversorgung,
      customer_note,
      location,
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

    //-------------------------------------------------
    if (delivery_date !== undefined) updateData.delivery_date = delivery_date;
    if (telefon !== undefined) updateData.telefon = telefon;
    if (filiale !== undefined) updateData.filiale = filiale;
    if (kunde !== undefined) updateData.kunde = kunde;
    if (email !== undefined) updateData.email = email;
    if (button_text !== undefined) updateData.button_text = button_text;
    if (fußanalyse !== undefined) updateData.fußanalyse = fußanalyse;
    if (einlagenversorgung !== undefined)
      updateData.einlagenversorgung = einlagenversorgung;
    if (customer_note !== undefined) updateData.customer_note = customer_note;
    if (location !== undefined) updateData.location = location;
    //-------------------------------------------------

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
      include: {
        massschuheOrderHistories: {
          orderBy: { startedAt: "desc" },
          select: {
            id: true,
            statusFrom: true,
            statusTo: true,
            startedAt: true,
            finishedAt: true,
            note: true,
          },
        },
        employee: {
          select: {
            id: true,
            employeeName: true,
            email: true,
            accountName: true,
          },
        },
      },
    });
    if (!massschuheOrder) {
      return res.status(404).json({
        success: false,
        message: "Massschuhe order not found",
      });
    }

    // Format order with status history (Started/Finished timestamps)
    const formattedOrder = formatOrderWithStatusHistory(massschuheOrder);

    return res.status(200).json({
      success: true,
      message: "Massschuhe order fetched successfully",
      data: formattedOrder,
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

export const updateMassschuheOrderStatus = async (
  req: Request,
  res: Response
) => {
  try {
    const { orderIds, status } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "orderIds must be a non-empty array",
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    // Validate status
    if (!VALID_STATUSES.includes(status as any)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status: "${status}"`,
        validStatuses: VALID_STATUSES,
        suggestion: `Did you mean one of these? ${VALID_STATUSES.join(", ")}`,
      });
    }

    // Get current orders to track status changes
    const currentOrders = await prisma.massschuhe_order.findMany({
      where: { id: { in: orderIds } },
      select: {
        id: true,
        status: true,
        userId: true,
        employeeId: true,
        customerId: true,
      },
    });

    if (currentOrders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No orders found with the provided IDs",
      });
    }

    // Verify ownership for all orders
    const unauthorizedOrders = currentOrders.filter(
      (order) => order.userId !== userId
    );
    if (unauthorizedOrders.length > 0) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to update some of these orders",
      });
    }

    // Use transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      const now = new Date();

      // Update all orders with matching IDs
      await tx.massschuhe_order.updateMany({
        where: { id: { in: orderIds } },
        data: { status },
      });

      // For each order, update history
      for (const order of currentOrders) {
        // Mark the previous status as finished (if there's an active history entry)
        const previousHistory = await tx.massschuhe_order_history.findFirst({
          where: {
            massschuhe_orderId: order.id,
            statusTo: order.status,
            finishedAt: null, // Only update entries that haven't been finished
          },
          orderBy: { startedAt: "desc" },
        });

        if (previousHistory) {
          // Mark previous status as finished
          await tx.massschuhe_order_history.update({
            where: { id: previousHistory.id },
            data: { finishedAt: now },
          });
        }

        // Create new history entry for the new status
        await tx.massschuhe_order_history.create({
          data: {
            massschuhe_orderId: order.id,
            statusFrom: order.status,
            statusTo: status,
            partnerId: userId,
            employeeId: order.employeeId || null,
            customerId: order.customerId || null,
            note: `Status changed from ${order.status} to ${status}`,
            startedAt: now,
          },
        });
      }

      // Fetch the updated orders with history
      const updatedOrders = await tx.massschuhe_order.findMany({
        where: { id: { in: orderIds } },
        select: {
          id: true,
          status: true,
          arztliche_diagnose: true,
          usführliche_diagnose: true,
          rezeptnummer: true,
          durchgeführt_von: true,
          note: true,
          albprobe_geplant: true,
          kostenvoranschlag: true,
          delivery_date: true,
          telefon: true,
          filiale: true,
          kunde: true,
          email: true,
          button_text: true,
          fußanalyse: true,
          einlagenversorgung: true,
          location: true,
          createdAt: true,
          updatedAt: true,
          massschuheOrderHistories: {
            orderBy: { startedAt: "desc" },
            select: {
              id: true,
              statusFrom: true,
              statusTo: true,
              startedAt: true,
              finishedAt: true,
              note: true,
            },
          },
        },
      });

      return updatedOrders;
    });

    // Format orders with status history (Started/Finished timestamps)
    const formattedOrders = result.map((order) =>
      formatOrderWithStatusHistory(order)
    );

    return res.status(200).json({
      success: true,
      message: "Massschuhe order status updated successfully",
      updatedCount: formattedOrders.length,
      data: formattedOrders,
    });
  } catch (error: any) {
    console.error("Update Massschuhe Order Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while updating massschuhe order status",
      error: error.message || error,
    });
  }
};

// ---------------------------------------------------------------------------
// Stats for massschuhe orders (current vs previous month)
// ---------------------------------------------------------------------------
export const getMassschuheOrderStats = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const startOfCurrentMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const startOfNextMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
    const startOfPrevMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));

    // Status buckets
    const waitingToStartStatus: $Enums.massschuhe_order_status = "Leistenerstellung";
    const activeStatuses: $Enums.massschuhe_order_status[] = [
      "Bettungsherstellung",
      "Halbprobenerstellung",
      "Schafterstellung",
      "Bodenerstellung",
    ];

    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) {
        return current > 0 ? 100 : 0;
      }
      return ((current - previous) / previous) * 100;
    };

    const [
      completedCurrent,
      completedPrevious,
      waitingCurrent,
      waitingPrevious,
      activeCurrent,
      activePrevious,
    ] = await Promise.all([
      // Completed = current snapshot of delivered orders
      prisma.massschuhe_order.count({
        where: { status: "Geliefert" },
      }),
      // Delivered last month (distinct orders)
      prisma.massschuhe_order_history
        .findMany({
        where: {
          statusTo: "Geliefert",
          startedAt: {
            gte: startOfPrevMonth,
            lt: startOfCurrentMonth,
          },
        },
          distinct: [Prisma.Massschuhe_order_historyScalarFieldEnum.massschuhe_orderId],
          select: { massschuhe_orderId: true },
        })
        .then((rows) => rows.length),
      // Waiting to start = current snapshot in initial status
      prisma.massschuhe_order.count({
        where: { status: waitingToStartStatus },
      }),
      // Previous month: distinct orders that entered waiting-to-start
      prisma.massschuhe_order_history
        .findMany({
        where: {
            statusTo: waitingToStartStatus,
          startedAt: {
            gte: startOfPrevMonth,
            lt: startOfCurrentMonth,
          },
        },
          distinct: [Prisma.Massschuhe_order_historyScalarFieldEnum.massschuhe_orderId],
          select: { massschuhe_orderId: true },
        })
        .then((rows) => rows.length),
      // Active = current snapshot in mid statuses
      prisma.massschuhe_order.count({
        where: { status: { in: activeStatuses } },
      }),
      // Previous month: distinct orders that entered active statuses
      prisma.massschuhe_order_history
        .findMany({
          where: {
            statusTo: { in: activeStatuses },
            startedAt: {
              gte: startOfPrevMonth,
              lt: startOfCurrentMonth,
            },
          },
          distinct: [Prisma.Massschuhe_order_historyScalarFieldEnum.massschuhe_orderId],
          select: { massschuhe_orderId: true },
        })
        .then((rows) => rows.length),
    ]);

    return res.status(200).json({
      success: true,
      message: "Massschuhe order stats fetched successfully",
      data: {
        completed: {
          current: completedCurrent,
          previous: completedPrevious,
          changePercent: calculateChange(completedCurrent, completedPrevious),
        },
        waitingToStart: {
          current: waitingCurrent,
          previous: waitingPrevious,
          changePercent: calculateChange(waitingCurrent, waitingPrevious),
        },
        active: {
          current: activeCurrent,
          previous: activePrevious,
          changePercent: calculateChange(activeCurrent, activePrevious),
        },
      },
    });
  } catch (error: any) {
    console.error("Error in getMassschuheOrderStats:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching massschuhe order stats",
      error: error?.message || "Unknown error",
    });
  }
};

// ---------------------------------------------------------------------------
// Revenue / orders line chart (delivered orders)
// ---------------------------------------------------------------------------
export const getMassschuheRevenueChart = async (req: Request, res: Response) => {
  try {
    // Optional query params: from, to (ISO dates).
    // Default: full current month (UTC): [1st day, 1st of next month)
    const today = new Date();
    const defaultFrom = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
    const defaultTo = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 1));

    const rawFrom = req.query.from ? new Date(String(req.query.from)) : defaultFrom;
    const rawTo = req.query.to ? new Date(String(req.query.to)) : null;

    // If only from is provided, set to to the first day of the next month of from
    const computedTo = rawTo
      ? new Date(Date.UTC(rawTo.getUTCFullYear(), rawTo.getUTCMonth(), rawTo.getUTCDate() + 1))
      : new Date(Date.UTC(rawFrom.getUTCFullYear(), rawFrom.getUTCMonth() + 1, 1));

    const from = new Date(Date.UTC(rawFrom.getUTCFullYear(), rawFrom.getUTCMonth(), rawFrom.getUTCDate()));
    const to = computedTo; // exclusive end

    // Get all delivered history entries in range with price fields from order
    const histories = await prisma.massschuhe_order_history.findMany({
      where: {
        statusTo: "Geliefert",
        startedAt: {
          gte: from,
          lt: to,
        },
      },
      select: {
        startedAt: true,
        massschuhe_order: {
          select: {
            fußanalyse: true,
            einlagenversorgung: true,
          },
        },
      },
    });

    // Aggregate by day
    const byDay = new Map<
      string,
      { date: string; count: number; revenue: number }
    >();

    for (const h of histories) {
      const d = h.startedAt;
      const dateKey = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(
        d.getUTCDate()
      ).padStart(2, "0")}`;
      const price =
        Number(h.massschuhe_order?.fußanalyse ?? 0) +
        Number(h.massschuhe_order?.einlagenversorgung ?? 0);
      if (!byDay.has(dateKey)) {
        byDay.set(dateKey, { date: dateKey, count: 0, revenue: 0 });
      }
      const entry = byDay.get(dateKey)!;
      entry.count += 1;
      entry.revenue += price;
    }

    // Fill missing days with zeros across the range
    const points: { date: string; count: number; revenue: number }[] = [];
    for (
      let d = new Date(from.getTime());
      d < to;
      d = new Date(d.getTime() + 24 * 60 * 60 * 1000)
    ) {
      const dateKey = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(
        d.getUTCDate()
      ).padStart(2, "0")}`;
      if (byDay.has(dateKey)) {
        points.push(byDay.get(dateKey)!);
      } else {
        points.push({ date: dateKey, count: 0, revenue: 0 });
      }
    }

    const totalCount = points.reduce((s, p) => s + p.count, 0);
    const totalRevenue = points.reduce((s, p) => s + p.revenue, 0);

    return res.status(200).json({
      success: true,
      message: "Massschuhe revenue chart fetched successfully",
      data: {
        from: from.toISOString(),
        to: to.toISOString(),
        points,
        totalCount,
        totalRevenue,
      },
    });
  } catch (error: any) {
    console.error("Error in getMassschuheRevenueChart:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching revenue chart",
      error: error?.message || "Unknown error",
    });
  }
};
