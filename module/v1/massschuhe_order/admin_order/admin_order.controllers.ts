import { Request, Response } from "express";
import fs from "fs";

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
    const isOrderSent = await prisma.custom_shafts.findFirst({
      where: {
        massschuhe_order_id: orderId,
        catagoary: "Halbprobenerstellung",
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
    const adminOrder = await prisma.custom_shafts.create({
      data: {
        massschuhe_order_id: orderId,
        partnerId: userId,
        image3d_1: threed_model_right,
        image3d_2: threed_model_left,
        invoice: invoice,
        isCompleted: false,
        catagoary: "Halbprobenerstellung",
      },
      select: {
        id: true,
        image3d_1: true,
        image3d_2: true,
        invoice: true,
        isCompleted: true,
        catagoary: true,
      },
    });

    const formattedOrder = {
      ...adminOrder,
      image3d_1: adminOrder.image3d_1
        ? getImageUrl(`/uploads/${adminOrder.image3d_1}`)
        : null,
      image3d_2: adminOrder.image3d_2
        ? getImageUrl(`/uploads/${adminOrder.image3d_2}`)
        : null,
      invoice: adminOrder.invoice ? getImageUrl(`/uploads/${adminOrder.invoice}`) : null,
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

// export const approveAdminOrder_1 = async (req: Request, res: Response) => {
//   try {
//     // Validate user is authenticated
//     const { orderIds } = req.body;

//     if (!Array.isArray(orderIds) || orderIds.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "orderIds must be a non-empty array",
//       });
//     }

//     // Get admin orders with their related massschuhe_order
//     const adminOrders = await prisma.massschuhe_order_admin_1.findMany({
//       where: { id: { in: orderIds } },
//       include: {
//         massschuhe_order: {
//           select: {
//             id: true,
//             status: true,
//           },
//         },
//       },
//     });

//     if (adminOrders.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "Orders not found",
//       });
//     }

//     // Check which orders were not found
//     const notFoundOrderIds = orderIds.filter(
//       (orderId) => !adminOrders.some((adminOrder) => adminOrder.id === orderId)
//     );
//     if (notFoundOrderIds.length > 0) {
//       return res.status(404).json({
//         success: false,
//         message: "Some orders not found",
//         notFoundOrderIds,
//       });
//     }

//     // Check if any orders are already completed
//     const alreadyCompleted = adminOrders.filter(
//       (adminOrder) => adminOrder.isCompleted
//     );
//     if (alreadyCompleted.length > 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Some orders are already completed",
//         completedOrderIds: alreadyCompleted.map((order) => order.id),
//       });
//     }

//     // Extract massschuhe_order IDs
//     const massschuheOrderIds = adminOrders.map(
//       (adminOrder) => adminOrder.massschuhe_orderId
//     );

//     // Check current status of all massschuhe_orders
//     const massschuheOrders = await prisma.massschuhe_order.findMany({
//       where: { id: { in: massschuheOrderIds } },
//       select: {
//         id: true,
//         status: true,
//       },
//     });

//     // Verify all orders are in the correct status (Leistenerstellung)
//     const invalidStatusOrders = massschuheOrders.filter(
//       (order) => order.status !== "Leistenerstellung"
//     );
//     if (invalidStatusOrders.length > 0) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Some orders are not in the correct status (Leistenerstellung)",
//         invalidOrderIds: invalidStatusOrders.map((order) => order.id),
//       });
//     }

//     // Use transaction to ensure all updates succeed or fail together
//     await prisma.$transaction(async (tx) => {
//       // Update admin orders to completed
//       await tx.massschuhe_order_admin_1.updateMany({
//         where: { id: { in: orderIds } },
//         data: { isCompleted: true },
//       });

//       // Update massschuhe_order status to Schafterstellung
//       await tx.massschuhe_order.updateMany({
//         where: { id: { in: massschuheOrderIds } },
//         data: { status: "Schafterstellung" },
//       });

//       // Create history entries for each massschuhe_order
//       await tx.massschuhe_order_history.createMany({
//         data: massschuheOrderIds.map((massschuheOrderId) => ({
//           massschuhe_orderId: massschuheOrderId,
//           statusFrom: "Leistenerstellung",
//           statusTo: "Schafterstellung",
//           partnerId: req.user.id,
//           note: `approved by admin Leistenerstellung to Schafterstellung`,
//         })),
//       });
//     });

//     return res.status(200).json({
//       success: true,
//       message: "Orders approved successfully",
//       approvedAdminOrderIds: orderIds,
//       updatedMassschuheOrderIds: massschuheOrderIds,
//     });
//   } catch (error: any) {
//     console.error("Approve Admin Order 1 Error:", error);
//   return res.status(500).json({
//     success: false,
//     message: "Internal server error",
//     error: error.message,
//   });
// }
// };

export const sendToAdminOrder_2 = async (req, res) => {
  //   "Halbprobenerstellung",
  // "Massschafterstellung",
  // "Bodenkonstruktion",

  const files = req.files as any;
  const { id } = req.user;

  try {
    const {
      customerId,
      other_customer_number,
      mabschaftKollektionId,
      lederfarbe,
      innenfutter,
      schafthohe,
      polsterung,
      vestarkungen,
      polsterung_text,
      vestarkungen_text,
      nahtfarbe,
      nahtfarbe_text,
      lederType,

      osen_einsetzen_price,
      Passenden_schnursenkel_price,
    } = req.body;

    const hasCustomerId = !!customerId;
    const hasOtherCustomerNumber =
      other_customer_number && other_customer_number.trim().length > 0;

    if (!hasCustomerId && !hasOtherCustomerNumber) {
      return res.status(400).json({
        success: false,
        message:
          "Provide either customerId or other_customer_number (exactly one is required)",
      });
    }

    if (hasCustomerId && hasOtherCustomerNumber) {
      return res.status(400).json({
        success: false,
        message:
          "Provide only one identifier: either customerId or other_customer_number, not both",
      });
    }

    if (!mabschaftKollektionId) {
      return res.status(400).json({
        success: false,
        message: "maßschaftKollektionId must be provided",
      });
    }

    if (hasCustomerId) {
      const customerExists = await prisma.customers.findUnique({
        where: { id: customerId },
        select: { id: true },
      });
      if (!customerExists) {
        return res.status(404).json({
          success: false,
          message: "Customer not found",
        });
      }
    }

    const [customer, kollektion] = await Promise.all([
      hasCustomerId
        ? prisma.customers.findUnique({
            where: { id: customerId },
            select: { id: true },
          })
        : Promise.resolve(null),

      mabschaftKollektionId
        ? prisma.maßschaft_kollektion.findUnique({
            where: { id: mabschaftKollektionId },
            select: { id: true },
          })
        : Promise.resolve(null),
    ]);

    // Validate results
    if (hasCustomerId && !customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    if (mabschaftKollektionId && !kollektion) {
      return res.status(404).json({
        success: false,
        message: "Maßschaft Kollektion not found",
      });
    }

    // Prepare data object
    const shaftData: any = {
      image3d_1: files.image3d_1?.[0]?.filename || null,
      image3d_2: files.image3d_2?.[0]?.filename || null,
      other_customer_number: !customer ? other_customer_number || null : null,
      lederfarbe: lederfarbe || null,
      innenfutter: innenfutter || null,
      schafthohe: schafthohe || null,
      polsterung: polsterung || null,
      vestarkungen: vestarkungen || null,
      polsterung_text: polsterung_text || null,
      vestarkungen_text: vestarkungen_text || null,
      nahtfarbe: nahtfarbe || null,
      nahtfarbe_text: nahtfarbe_text || null,
      lederType: lederType || null,
      orderNumber: `MS-${new Date().getFullYear()}-${Math.floor(
        10000 + Math.random() * 90000
      )}`,
      status: "Neu" as any,
      osen_einsetzen_price: osen_einsetzen_price
        ? parseFloat(osen_einsetzen_price)
        : null,
      Passenden_schnursenkel_price: Passenden_schnursenkel_price
        ? parseFloat(Passenden_schnursenkel_price)
        : null,
      catagoary: "Massschafterstellung",
    };

    if (customer) {
      shaftData.customer = {
        connect: {
          id: customerId,
        },
      };
    }

    if (kollektion) {
      shaftData.maßschaft_kollektion = {
        connect: {
          id: mabschaftKollektionId,
        },
      };
    }

    shaftData.user = {
      connect: {
        id,
      },
    };

    // Create the custom shaft
    const customShaft = await prisma.custom_shafts.create({
      data: shaftData,
      include: {
        customer: {
          select: {
            id: true,
            vorname: true,
            nachname: true,
            email: true,
          },
        },
        maßschaft_kollektion: {
          select: {
            id: true,
            name: true,
            price: true,
            image: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    // Format response (non-blocking)
    const formattedCustomShaft = {
      ...customShaft,
      image3d_1: customShaft.image3d_1
        ? getImageUrl(`/uploads/${customShaft.image3d_1}`)
        : null,
      image3d_2: customShaft.image3d_2
        ? getImageUrl(`/uploads/${customShaft.image3d_2}`)
        : null,
      maßschaft_kollektion: customShaft.maßschaft_kollektion
        ? {
            ...customShaft.maßschaft_kollektion,
            image: customShaft.maßschaft_kollektion.image
              ? getImageUrl(`/uploads/${customShaft.maßschaft_kollektion.image}`)
              : null,
          }
        : null,
      partner: customShaft.user
        ? {
            ...customShaft.user,
            image: customShaft.user.image
              ? getImageUrl(`/uploads/${customShaft.user.image}`)
              : null,
          }
        : null,
    };

    const { user, ...finalFormattedShaft } = formattedCustomShaft;

    // Send response immediately
    res.status(201).json({
      success: true,
      message: "Custom shaft created successfully",
      data: finalFormattedShaft,
    });
  } catch (err: any) {
    console.error("Create Custom Shaft Error:", err);

    // File cleanup (non-blocking)
    if (files) {
      Object.keys(files).forEach((key) => {
        files[key].forEach((file: any) => {
          fs.unlink(file.path, (error) => {
            if (error)
              console.error(`Failed to delete file ${file.path}`, error);
          });
        });
      });
    }

    if (err.code === "P2003") {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID or Maßschaft Kollektion ID provided",
      });
    }

    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: err.message,
    });
  }
};

export const sendToAdminOrder_3 = async (req, res) => {
  try {
    const { id } = req.user;
    const files = req.files as any;
    const invoice = files?.invoice?.[0]?.filename || null;
    const orderId = req.params.orderId;
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
