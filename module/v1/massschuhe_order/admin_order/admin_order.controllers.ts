import { Request, Response } from "express";

import { PrismaClient } from "@prisma/client";
import { getImageUrl } from "../../../../utils/base_utl";
const prisma = new PrismaClient();

export const sendToAdminOrder_1 = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    // Validate user is authenticated
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: user not authenticated",
      });
    }

    const files = req.files as any;
    const threed_model_right = files?.threed_model_right?.[0]?.filename || null;
    const threed_model_left = files?.threed_model_left?.[0]?.filename || null;
    const invoice = files?.invoice?.[0]?.filename || null;

    const userId = req.user.id;
    const order = await prisma.massschuhe_order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // check if the order is already sent to admin 1
    const isOrderSent = await prisma.massschuhe_order_admin_1.findFirst({
      where: {
        massschuhe_orderId: orderId,
        isCompleted: false,
      },
    });
    if (isOrderSent) {
      return res.status(400).json({
        success: false,
        message:
          "Order already sent to production. Please wait for complete the order.",
      });
    }

    if (order.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to send this order to admin",
      });
    }
    const adminOrder = await prisma.massschuhe_order_admin_1.create({
      data: {
        massschuhe_orderId: orderId,
        partnerId: userId,
        threed_model_right: threed_model_right,
        threed_model_left: threed_model_left,
        invoice: invoice,
        isCompleted: false,
      },
    });

    const formattedOrder = {
      ...adminOrder,
      threed_model_right: adminOrder.threed_model_right
        ? getImageUrl(`/uploads/${adminOrder.threed_model_right}`)
        : null,
      threed_model_left: adminOrder.threed_model_left
        ? getImageUrl(`/uploads/${adminOrder.threed_model_left}`)
        : null,
      invoice: adminOrder.invoice
        ? getImageUrl(`/uploads/${adminOrder.invoice}`)
        : null,
    };

    return res.status(200).json({
      success: true,
      message: "Order sent to admin 1 successfully",
      data: formattedOrder,
    });
  } catch (error: any) {
    console.error("Send to Admin Order 1 Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getAllAdminOrders_1 = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const search = (req.query.search as string) || "";
    const where: any = {};
    if (search) {
      where.OR = [
        {
          massschuhe_order: {
            customer: { vorname: { contains: search, mode: "insensitive" } },
          },
        },
        {
          massschuhe_order: {
            customer: { nachname: { contains: search, mode: "insensitive" } },
          },
        },
        {
          massschuhe_order: {
            customer: { email: { contains: search, mode: "insensitive" } },
          },
        },
      ];
    }
    const [adminOrders, totalItems] = await Promise.all([
      prisma.massschuhe_order_admin_1.findMany({
        where,
        select: {
          id: true,
          threed_model_right: true,
          threed_model_left: true,
          invoice: true,
          isCompleted: true,
          createdAt: true,
          partner: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              phone: true,
              busnessName: true,
            },
          },

          // id String @id @default(uuid())

          // orderNumber Int?

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

          // bodenerstellungpdf String?
          // geliefertpdf       String?

          // customer_note String?
          // location      String?
          // //-------------------------------------------------
          // status        massschuhe_order_status @default(Leistenerstellung)
          // express       Boolean?                @default(false)

          // //-------------------------------------------------

          // //relation with users
          // userId String?
          // user   User?   @relation(fields: [userId], references: [id], onDelete: SetNull)

          // employeeId String?
          // employee   Employees? @relation(fields: [employeeId], references: [id], onDelete: SetNull)

          // customerId String?
          // customer   customers? @relation(fields: [customerId], references: [id], onDelete: SetNull)

          // createdAt                DateTime                   @default(now())
          // updatedAt                DateTime                   @updatedAt
          // massschuheOrderHistories massschuhe_order_history[]
          // massschuheOrderAdmin1s   massschuhe_order_admin_1[]

          massschuhe_order: {
            select: {
              id: true,
              orderNumber: true,
              status: true,
              express: true,
              delivery_date: true,
              telefon: true,
              filiale: true,
              kunde: true,
              email: true,
              button_text: true,
              fußanalyse: true,
              einlagenversorgung: true,
              bodenerstellungpdf: true,
              geliefertpdf: true,
              customer_note: true,
              location: true,
              customer: {
                select: {
                  vorname: true,
                  nachname: true,
                  email: true,
                },
              },
            },
          },
        },

        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.massschuhe_order_admin_1.count({
        where,
      }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    const formattedAdminOrders = adminOrders.map((adminOrder) => ({
      ...adminOrder,
      threed_model_right: adminOrder.threed_model_right
        ? getImageUrl(`/uploads/${adminOrder.threed_model_right}`)
        : null,
      threed_model_left: adminOrder.threed_model_left
        ? getImageUrl(`/uploads/${adminOrder.threed_model_left}`)
        : null,
      invoice: adminOrder.invoice
        ? getImageUrl(`/uploads/${adminOrder.invoice}`)
        : null,
      partner: {
        ...adminOrder.partner,
        image: adminOrder.partner.image
          ? getImageUrl(`/uploads/${adminOrder.partner.image}`)
          : null,
      },
    }));

    return res.status(200).json({
      success: true,
      message: "Admin orders 1 fetched successfully",
      data: formattedAdminOrders,
      pagination: {
        totalItems: totalItems,
        totalPages: totalPages,
        currentPage: page,
        itemsPerPage: limit,
        hasNextPage: hasNextPage,
        hasPrevPage: hasPrevPage,
      },
    });
  } catch (error) {
    console.error("Get all Admin Orders 1 Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

//approve admin 1 order i need to approved list of orders
export const approveAdminOrder_1 = async (req: Request, res: Response) => {
  try {
    // Validate user is authenticated
    const { orderIds } = req.body;

    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "orderIds must be a non-empty array",
      });
    }

    // Get admin orders with their related massschuhe_order
    const adminOrders = await prisma.massschuhe_order_admin_1.findMany({
      where: { id: { in: orderIds } },
      include: {
        massschuhe_order: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    if (adminOrders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Orders not found",
      });
    }

    // Check which orders were not found
    const notFoundOrderIds = orderIds.filter(
      (orderId) => !adminOrders.some((adminOrder) => adminOrder.id === orderId)
    );
    if (notFoundOrderIds.length > 0) {
      return res.status(404).json({
        success: false,
        message: "Some orders not found",
        notFoundOrderIds,
      });
    }

    // Check if any orders are already completed
    const alreadyCompleted = adminOrders.filter(
      (adminOrder) => adminOrder.isCompleted
    );
    if (alreadyCompleted.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Some orders are already completed",
        completedOrderIds: alreadyCompleted.map((order) => order.id),
      });
    }

    // Extract massschuhe_order IDs
    const massschuheOrderIds = adminOrders.map(
      (adminOrder) => adminOrder.massschuhe_orderId
    );

    // Check current status of all massschuhe_orders
    const massschuheOrders = await prisma.massschuhe_order.findMany({
      where: { id: { in: massschuheOrderIds } },
      select: {
        id: true,
        status: true,
      },
    });

    // Verify all orders are in the correct status (Leistenerstellung)
    const invalidStatusOrders = massschuheOrders.filter(
      (order) => order.status !== "Leistenerstellung"
    );
    if (invalidStatusOrders.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Some orders are not in the correct status (Leistenerstellung)",
        invalidOrderIds: invalidStatusOrders.map((order) => order.id),
      });
    }

    // Use transaction to ensure all updates succeed or fail together
    await prisma.$transaction(async (tx) => {
      // Update admin orders to completed
      await tx.massschuhe_order_admin_1.updateMany({
        where: { id: { in: orderIds } },
        data: { isCompleted: true },
      });

      // Update massschuhe_order status to Schafterstellung
      await tx.massschuhe_order.updateMany({
        where: { id: { in: massschuheOrderIds } },
        data: { status: "Schafterstellung" },
      });

      // Create history entries for each massschuhe_order
      await tx.massschuhe_order_history.createMany({
        data: massschuheOrderIds.map((massschuheOrderId) => ({
          massschuhe_orderId: massschuheOrderId,
          statusFrom: "Leistenerstellung",
          statusTo: "Schafterstellung",
          partnerId: req.user.id,
          note: `approved by admin Leistenerstellung to Schafterstellung`,
        })),
      });
    });

    return res.status(200).json({
      success: true,
      message: "Orders approved successfully",
      approvedAdminOrderIds: orderIds,
      updatedMassschuheOrderIds: massschuheOrderIds,
    });
  } catch (error: any) {
    console.error("Approve Admin Order 1 Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
