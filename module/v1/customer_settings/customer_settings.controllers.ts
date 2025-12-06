    import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET - Get customer settings
export const getCustomerSettings = async (req: Request, res: Response) => {
  try {
    const partnerId = req.user.id;

    const customerSettings = await prisma.customer_settings.findFirst({
      where: { partnerId },
    });

    if (!customerSettings) {
      return res.status(404).json({
        success: false,
        message: "Customer settings not found for this partner",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Customer settings fetched successfully",
      data: customerSettings,
    });
  } catch (error: any) {
    console.error("Error in getCustomerSettings:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching customer settings",
      error: error.message,
    });
  }
};

// POST - Create or Update customer settings
export const setCustomerSettings = async (req: Request, res: Response) => {
  try {
    const { cover_types, laser_print_prices } = req.body;
    const partnerId = req.user.id;

    // Validate input
    if (!Array.isArray(cover_types)) {
      return res.status(400).json({
        success: false,
        message: "cover_types must be an array",
      });
    }
    if (!Array.isArray(laser_print_prices)) {
      return res.status(400).json({
        success: false,
        message: "laser_print_prices must be an array",
      });
    }

    // Check if settings already exist
    const existingSettings = await prisma.customer_settings.findFirst({
      where: { partnerId },
    });

    let customerSettings;
    if (existingSettings) {
      // Update existing settings using id
      customerSettings = await prisma.customer_settings.update({
        where: { id: existingSettings.id },
        data: {
          cover_types: cover_types as string[],
          laser_print_prices: laser_print_prices as number[],
        },
      });
    } else {
      // Create new settings
      customerSettings = await prisma.customer_settings.create({
        data: {
          partnerId,
          cover_types: cover_types as string[],
          laser_print_prices: laser_print_prices as number[],
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Customer settings saved successfully",
      data: customerSettings,
    });
  } catch (error: any) {
    console.error("Error in setCustomerSettings:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while saving customer settings",
      error: error.message,
    });
  }
};

// DELETE - Delete customer settings
export const deleteCustomerSettings = async (req: Request, res: Response) => {
  try {
    const partnerId = req.user.id;

    const existingSettings = await prisma.customer_settings.findFirst({
      where: { partnerId },
    });

    if (!existingSettings) {
      return res.status(404).json({
        success: false,
        message: "Customer settings not found for this partner",
      });
    }

    await prisma.customer_settings.delete({
      where: { id: existingSettings.id },
    });

    return res.status(200).json({
      success: true,
      message: "Customer settings deleted successfully",
    });
  } catch (error: any) {
    console.error("Error in deleteCustomerSettings:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while deleting customer settings",
      error: error.message,
    });
  }
};
