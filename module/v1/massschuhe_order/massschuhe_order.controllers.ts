import { Prisma } from "@prisma/client";
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();


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

    const massschuheOrder = await prisma.massschuhe_order.create({
      data: createData,
    });



    // id String @id @default(uuid())

    // statusFrom OrderStatus
    // statusTo   OrderStatus
    // note       String?
  
    // //relation
    // massschuhe_orderId String
    // massschuhe_order   massschuhe_order @relation(fields: [massschuhe_orderId], references: [id], onDelete: Cascade)
  
    // partnerId String?
    // partner   User?   @relation(fields: [partnerId], references: [id], onDelete: SetNull)
  
    // employeeId String?
    // employee   Employees? @relation(fields: [employeeId], references: [id], onDelete: SetNull)
  
    // customerId String?
    // customer   customers? @relation(fields: [customerId], references: [id], onDelete: SetNull)
  
    // createdAt DateTime @default(now()

    //create a customer history entry
    await prisma.customerHistorie.create({
      data: {
        customerId,
        category: "Bestellungen",
        note: "Massschuhe order created",
        eventId: massschuheOrder.id,
        system_note: "Massschuhe order created",
      },
    });

  //i need to create a massschuhe order history entry
  // await prisma.massschuhe_order_history.create({
  //   data: {
  //     massschuhe_orderId: massschuheOrder.id,
  //     statusFrom: "Leistenerstellung",
  //     statusTo: "Leistenerstellung",

  //     note: "Massschuhe order created",
  //   },
  // });

    // Create a stores history entry only when a valid store exists for this partner
    // const partnerStore = await prisma.stores.findFirst({
    //   where: { userId },
    //   select: { id: true, userId: true },
    // });

    // if (partnerStore) {
    //   await prisma.storesHistory.create({
    //     data: {
    //       storeId: partnerStore.id,
    //       changeType: "sales",
    //       newStock: 0,
    //       reason: "massschuhe order created",
    //       partnerId: partnerStore.userId,
    //       customerId,
    //       orderId: massschuheOrder.id,
    //     },
    //   });
    // }

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
    const [totalItems, massschuheOrders] = await Promise.all([
      prisma.massschuhe_order.count({ where }),
      prisma.massschuhe_order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
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

    return res.status(200).json({
      success: true,
      message: "Massschuhe order fetched successfully",
      data: massschuheOrders,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        itemsPerPage: limit,
        hasNextPage,
        hasPrevPage,
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

export const updateMassschuheOrderStatus = async (req: Request, res: Response) => {
  try {
    const { orderIds, status } = req.body;

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

    // Allowed statuses
    const statusList = [
      "Leistenerstellung",
      "Bettungsherstellung",
      "Halbprobenerstellung",
      "Schafterstellung",
      "Bodenerstellung",
      "Geliefert",
    ];

    if (!statusList.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
        statusList,
      });
    }
    // i need to show some data with response
    // Update all orders with matching IDs
    const updatedOrders = await prisma.massschuhe_order.updateMany({
      where: { id: { in: orderIds } },
      data: { status },
    });
    //check updated orders is success or not
    if (updatedOrders.count === 0) {
      return res.status(400).json({
        success: false,
        message: "No orders updated",
      });
    }

    // id String @id @default(uuid())

    // arztliche_diagnose    String?
    // usführliche_diagnose String?
    // rezeptnummer          String?
    // durchgeführt_von     String?
    // note                  String?
  
    // albprobe_geplant   Boolean? @default(false)
    // kostenvoranschlag  Boolean? @default(false)
    // //-------------------------------------------------
    // //workload section
    // delivery_date      String?
    // telefon            String?
    // filiale            String? //location
    // kunde              String? //customer name
    // email              String?
    // button_text        String?
    // // PREISAUSWAHL
    // fußanalyse        Float?
    // einlagenversorgung Float?
    // customer_note      String?
    // location           String?
    // //-------------------------------------------------
    // status  massschuhe_order_status @default(Leistenerstellung)
  
    // //-------------------------------------------------
  
    // //relation with users
    // userId String?
    // user   User?   @relation(fields: [userId], references: [id], onDelete: SetNull)
  
    // employeeId String?
    // employee   Employees? @relation(fields: [employeeId], references: [id], onDelete: SetNull)
  
    // customerId String?
    // customer   customers? @relation(fields: [customerId], references: [id], onDelete: SetNull)
  
    // createdAt DateTime @default(now())
    // updatedAt DateTime @updatedAt


    // Fetch the updated orders to show desired fields
    const orders = await prisma.massschuhe_order.findMany({
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
      },
    });

    return res.status(200).json({
      success: true,
      message: "Massschuhe order status updated successfully",
      updatedCount: orders,
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

