import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import iconv from "iconv-lite";
import csvParser from "csv-parser";
import { getImageUrl } from "../../../utils/base_utl";
import path from "path";

const prisma = new PrismaClient();

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { customerId, versorgungId } = req.body;
    const partnerId = req.user.id;

    if (!customerId || !versorgungId) {
      return res.status(400).json({
        success: false,
        message: "Customer ID and Versorgung ID are required",
      });
    }

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
          customer: {
            select: {
              id: true,
              vorname: true,
              nachname: true,
              email: true,
              telefonnummer: true,
              customerNumber: true,
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

    const formattedOrder = {
      ...order,
      invoice: order.invoice ? getImageUrl(`/uploads/${order.invoice}`) : null,
      partner: order.partner
        ? {
            ...order.partner,
            image: order.partner.image
              ? getImageUrl(`/uploads/${order.partner.image}`)
              : null,
          }
        : null,
    };

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: formattedOrder,
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

    // Format orders with invoice URL
    const formattedOrders = orders.map(order => ({
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

    const formattedOrder = {
      ...order,
      invoice: order.invoice ? getImageUrl(`/uploads/${order.invoice}`) : null,
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
      invoice: updatedOrder.invoice ? getImageUrl(`/uploads/${updatedOrder.invoice}`) : null,
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
    
    if (!invoiceFile.mimetype.includes('pdf')) {
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
      const oldInvoicePath = path.join(process.cwd(), "uploads", existingOrder.invoice);
      if (fs.existsSync(oldInvoicePath)) {
        try {
          fs.unlinkSync(oldInvoicePath);
          console.log(`Deleted old invoice file: ${oldInvoicePath}`);
        } catch (err) {
          console.error(`Failed to delete old invoice file: ${oldInvoicePath}`, err);
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
      invoice: updatedOrder.invoice ? getImageUrl(`/uploads/${updatedOrder.invoice}`) : null,
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
    console.error("Upload Invoice Error:", error);
    cleanupFiles();
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const order = await prisma.customerOrders.findUnique({
      where: { id },
      include: {
        product: true,
      },
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

    // await prisma.$transaction(async (tx) => {
    //   await tx.customerHistorie.deleteMany({
    //     where: {
    //       eventId: id,
    //       category: "Bestellungen",
    //     },
    //   });
    //   await tx.customerOrders.delete({
    //     where: { id },
    //   });
    // });

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
