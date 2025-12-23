import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import iconv from "iconv-lite";
import csvParser from "csv-parser";
import { getImageUrl } from "../../../../utils/base_utl";
import path from "path";
import {
  sendPdfToEmail,
  sendInvoiceEmail,
} from "../../../../utils/emailService.utils";

const prisma = new PrismaClient();


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
        barcodeCreatedAt: updatedOrder?.barcodeCreatedAt,

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