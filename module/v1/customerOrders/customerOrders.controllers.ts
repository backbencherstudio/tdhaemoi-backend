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

// export const createOrder = async (req: Request, res: Response) => {
//   try {
//     const { customerId, versorgungId } = req.body;
//     const partnerId = req.user.id;

//     if (!customerId || !versorgungId) {
//       return res.status(400).json({
//         success: false,
//         message: "Customer ID and Versorgung ID are required",
//       });
//     }

//     const [customer, versorgung] = await Promise.all([
//       prisma.customers.findUnique({
//         where: { id: customerId },
//         select: {
//           id: true,
//           vorname: true,
//           nachname: true,
//           fußanalyse: true,
//           einlagenversorgung: true,
//         },
//       }),
//       prisma.versorgungen.findUnique({
//         where: { id: versorgungId },
//       }),
//     ]);

//     if (!customer) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Customer not found" });
//     }
//     if (!versorgung) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Versorgung not found" });
//     }

//     if (customer.fußanalyse == null || customer.einlagenversorgung == null) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "fußanalyse or einlagenversorgung price is not set for this customer",
//       });
//     }

//     const totalPrice = customer.fußanalyse + customer.einlagenversorgung;

//     const order = await prisma.$transaction(async (tx) => {
//       const customerProduct = await tx.customerProduct.create({
//         data: {
//           name: versorgung.name,
//           rohlingHersteller: versorgung.rohlingHersteller,
//           artikelHersteller: versorgung.artikelHersteller,
//           versorgung: versorgung.versorgung,
//           material: versorgung.material,
//           langenempfehlung: versorgung.langenempfehlung,
//           status: versorgung.status,
//           diagnosis_status: versorgung.diagnosis_status,
//         },
//       });

//       const newOrder = await tx.customerOrders.create({
//         data: {
//           customerId,
//           partnerId,
//           fußanalyse: customer.fußanalyse,
//           einlagenversorgung: customer.einlagenversorgung,
//           totalPrice,
//           orderStatus: 'Sarted',
//           productId: customerProduct.id,
//           statusUpdate: new Date(),
//         },
//         include: {
//           product: true,
//           customer: {
//             select: {
//               id: true,
//               vorname: true,
//               nachname: true,
//               email: true,
//               telefonnummer: true,
//               customerNumber: true,
//             },
//           },
//           partner: {
//             select: {
//               id: true,
//               name: true,
//               email: true,
//               image: true,
//               role: true,
//             },
//           },
//         },
//       });

//       await tx.customerHistorie.create({
//         data: {
//           customerId,
//           category: "Bestellungen",
//           eventId: newOrder.id,
//           note: "New order created",
//           system_note: "New order created",
//           paymentIs: totalPrice.toString(),
//         },
//       });

//       return newOrder;
//     });

//     const formattedOrder = {
//       ...order,
//       invoice: order.invoice ? getImageUrl(`/uploads/${order.invoice}`) : null,
//       partner: order.partner
//         ? {
//             ...order.partner,
//             image: order.partner.image
//               ? getImageUrl(`/uploads/${order.partner.image}`)
//               : null,
//           }
//         : null,
//     };

//     return res.status(201).json({
//       success: true,
//       message: "Order created successfully",
//       data: formattedOrder,
//     });
//   } catch (error: any) {
//     console.error("Create Order Error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Something went wrong",
//       error: error.message,
//     });
//   }
// };

// export const createOrder = async (req: Request, res: Response) => {
//   try {
//     const { customerId, versorgungId } = req.body;
//     const partnerId = req.user.id;

//     // Basic input validation
//     if (!customerId || !versorgungId) {
//       return res.status(400).json({
//         success: false,
//         message: "Customer ID and Versorgung ID are required",
//       });
//     }

//     // Parallel validation and data fetching
//     const [customer, versorgung, partner] = await Promise.all([
//       prisma.customers.findUnique({
//         where: { id: customerId },
//         select: {
//           id: true,
//           vorname: true,
//           nachname: true,
//           email: true,
//           telefonnummer: true,
//           customerNumber: true,
//           fußanalyse: true,
//           einlagenversorgung: true,
//         },
//       }),
//       prisma.versorgungen.findUnique({
//         where: { id: versorgungId },
//         select: {
//           id: true,
//           name: true,
//           rohlingHersteller: true,
//           artikelHersteller: true,
//           versorgung: true,
//           material: true,
//           langenempfehlung: true,
//           status: true,
//           diagnosis_status: true,
//         },
//       }),
//       prisma.user.findUnique({
//         where: { id: partnerId },
//         select: {
//           id: true,
//           name: true,
//           email: true,
//           image: true,
//           role: true,
//         },
//       }),
//     ]);

//     // Early validation returns
//     if (!customer) {
//       return res.status(404).json({
//         success: false,
//         message: "Customer not found"
//       });
//     }
//     if (!versorgung) {
//       return res.status(404).json({
//         success: false,
//         message: "Versorgung not found"
//       });
//     }
//     if (!partner) {
//       return res.status(404).json({
//         success: false,
//         message: "Partner not found"
//       });
//     }
//     if (customer.fußanalyse == null || customer.einlagenversorgung == null) {
//       return res.status(400).json({
//         success: false,
//         message: "fußanalyse or einlagenversorgung price is not set for this customer",
//       });
//     }

//     const totalPrice = customer.fußanalyse + customer.einlagenversorgung;

//     // Single optimized transaction - include history creation INSIDE the transaction
//     const order = await prisma.$transaction(async (tx) => {
//       // Create customer product with only necessary fields
//       const customerProduct = await tx.customerProduct.create({
//         data: {
//           name: versorgung.name,
//           rohlingHersteller: versorgung.rohlingHersteller,
//           artikelHersteller: versorgung.artikelHersteller,
//           versorgung: versorgung.versorgung,
//           material: versorgung.material,
//           langenempfehlung: versorgung.langenempfehlung,
//           status: versorgung.status,
//           diagnosis_status: versorgung.diagnosis_status,
//         },
//         select: {
//           id: true,
//           name: true,
//           createdAt: true,
//           updatedAt: true,
//         },
//       });

//       // Create order with minimal include
//       const newOrder = await tx.customerOrders.create({
//         data: {
//           customerId,
//           partnerId,
//           fußanalyse: customer.fußanalyse,
//           einlagenversorgung: customer.einlagenversorgung,
//           totalPrice,
//           productId: customerProduct.id,
//           statusUpdate: new Date(),
//         },
//         select: {
//           id: true,
//           customerId: true,
//           partnerId: true,
//           fußanalyse: true,
//           einlagenversorgung: true,
//           totalPrice: true,
//           productId: true,
//           orderStatus: true,
//           statusUpdate: true,
//           createdAt: true,
//           updatedAt: true,
//         },
//       });

//       // Create history INSIDE the transaction (not after it)
//       await tx.customerHistorie.create({
//         data: {
//           customerId,
//           category: "Bestellungen",
//           eventId: newOrder.id,
//           note: "New order created",
//           system_note: "New order created",
//           paymentIs: totalPrice.toString(),
//         },
//       });

//       return {
//         ...newOrder,
//         customer: {
//           id: customer.id,
//           vorname: customer.vorname,
//           nachname: customer.nachname,
//           email: customer.email,
//           telefonnummer: customer.telefonnummer,
//           customerNumber: customer.customerNumber,
//         },
//         product: {
//           id: customerProduct.id,
//           name: customerProduct.name,
//           rohlingHersteller: versorgung.rohlingHersteller,
//           artikelHersteller: versorgung.artikelHersteller,
//           versorgung: versorgung.versorgung,
//           material: versorgung.material,
//           langenempfehlung: versorgung.langenempfehlung,
//           status: versorgung.status,
//           diagnosis_status: versorgung.diagnosis_status,
//           createdAt: customerProduct.createdAt,
//           updatedAt: customerProduct.updatedAt,
//         },
//         partner: {
//           id: partner.id,
//           name: partner.name,
//           email: partner.email,
//           image: partner.image,
//           role: partner.role,
//         },
//       };
//     });

//     // Format image URL outside transaction for better performance
//     const formattedOrder = {
//       ...order,
//       partner: {
//         ...order.partner,
//         image: order.partner.image ? getImageUrl(`/uploads/${order.partner.image}`) : null,
//       },
//     };

//     return res.status(201).json({
//       success: true,
//       message: "Order created successfully",
//       data: formattedOrder,
//     });

//   } catch (error: any) {
//     console.error("Create Order Error:", error);

//     // Specific error handling
//     if (error.code === 'P2002') {
//       return res.status(409).json({
//         success: false,
//         message: "Order already exists for this product",
//       });
//     }

//     if (error.code === 'P2003') {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid reference ID provided",
//       });
//     }

//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined,
//     });
//   }
// };

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
        select: { fußanalyse: true, einlagenversorgung: true },
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

    const order = await prisma.$transaction(async (tx) => {
      const customerProduct = await tx.customerProduct.create({
        data: { ...versorgung },
      });

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
      orderId: order.id,
    });
  } catch (error) {
    console.error("Create Order Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

// export const getAllOrders = async (req: Request, res: Response) => {
//   try {
//     const page = parseInt(req.query.page as string) || 1;
//     const limit = parseInt(req.query.limit as string) || 10;
//     const skip = (page - 1) * limit;

//     const where: any = {};

//     if (req.query.customerId) {
//       where.customerId = req.query.customerId as string;
//     }

//     if (req.query.partnerId) {
//       where.partnnerId = req.query.partnerId as string;
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
//           //   partner: {
//           //     select: {
//           //       id: true,
//           //       name: true,
//           //       email: true,
//           //     },
//           //   },
//           //   product: {
//           //     select: {
//           //       id: true,
//           //       name: true,
//           //       status: true,
//           //       diagnosis_status: true,
//           //     },
//           //   },
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

export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const days = parseInt(req.query.days as string);
    const skip = (page - 1) * limit;

    const where: any = {};

    // Add date filter based on days parameter
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

    if (req.query.partnerId) {
      where.partnerId = req.query.partnerId as string;
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
        },
      }),
      prisma.customerOrders.count({ where }),
    ]);

    // Format orders with invoice URL
    const formattedOrders = orders.map((order) => ({
      ...order,
      invoice: order.invoice ? getImageUrl(`/uploads/${order.invoice}`) : null,
    }));

    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
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

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const order = await prisma.customerOrders.findUnique({
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
            weitereStandorte: true,
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
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const formattedOrder = {
      ...order,
      invoice: order.invoice ? getImageUrl(`/uploads/${order.invoice}`) : null,
      partner: order.partner
        ? {
            ...order.partner,
            image: order.partner.image
              ? getImageUrl(`/uploads/${order.partner.image}`)
              : null,
            hauptstandort: order.partner.workshopNote?.sameAsBusiness
              ? order.partner.hauptstandort
              : null,
          }
        : null,
    };

    res.status(200).json({
      success: true,
      message: "Order fetched successfully",
      data: formattedOrder,
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
    const { email } = req.body; // Optional: override customer email

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

export const getLast40DaysOrderStats = async (req: Request, res: Response) => {
  try {
    const fortyDaysAgo = new Date();
    fortyDaysAgo.setDate(fortyDaysAgo.getDate() - 40);

    const { status, includeAll } = req.query;

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
          gte: fortyDaysAgo,
        },
        ...statusFilter,
      },
      select: {
        totalPrice: true,
        createdAt: true,
      },
    });

    // console.log("Filter applied:", statusFilter);
    // console.log("All orders found:", allOrders.length);
    // console.log("Sample orders:", allOrders.slice(0, 3));

    const dateRange = Array.from({ length: 40 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (39 - i));
      return date.toISOString().split("T")[0];
    });

    const revenueMap = new Map();

    allOrders.forEach((order) => {
      const dateKey = order.createdAt.toISOString().split("T")[0];
      const existing = revenueMap.get(dateKey) || { revenue: 0, count: 0 };
      revenueMap.set(dateKey, {
        revenue: existing.revenue + (order.totalPrice || 0),
        count: existing.count + 1,
      });
    });

    console.log("Revenue map:", Object.fromEntries(revenueMap));

    const chartData = dateRange.map((dateKey) => {
      const dayData = revenueMap.get(dateKey) || { revenue: 0, count: 0 };
      return {
        date: formatChartDate(dateKey),
        value: Math.round(dayData.revenue),
      };
    });

    let totalRevenue = 0;
    let maxRevenue = 0;
    let minRevenue = Infinity;
    let totalOrders = 0;

    for (const dayData of revenueMap.values()) {
      const revenue = dayData.revenue;
      totalRevenue += revenue;
      totalOrders += dayData.count;
      if (revenue > maxRevenue) maxRevenue = revenue;
      if (revenue < minRevenue) minRevenue = revenue;
    }

    if (minRevenue === Infinity) minRevenue = 0;

    const averageDailyRevenue = Math.round(totalRevenue / 40);
    const maxRevenueDay =
      chartData.find((day) => Math.round(maxRevenue) === day.value) ||
      chartData[0];
    const minRevenueDay =
      chartData.find((day) => Math.round(minRevenue) === day.value) ||
      chartData[0];

    const statusBreakdown = await prisma.customerOrders.groupBy({
      by: ["orderStatus"],
      where: {
        createdAt: {
          gte: fortyDaysAgo,
        },
      },
      _count: {
        id: true,
      },
      _sum: {
        totalPrice: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "Last 40 days order statistics fetched successfully",
      data: {
        chartData,
        statistics: {
          totalRevenue: Math.round(totalRevenue),
          averageDailyRevenue,
          maxRevenueDay,
          minRevenueDay,
          totalOrders,
        },
      },
    });
  } catch (error: any) {
    console.error("Get Last 40 Days Stats Error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
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
        geschaeftsstandort,
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
        geschaeftsstandort,
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
