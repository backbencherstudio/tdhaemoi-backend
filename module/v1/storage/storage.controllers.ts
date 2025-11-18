import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Calculate Status dynamically based on mindestbestand and groessenMengen
 * @param groessenMengen - JSON object with sizes and quantities
 *   New format: {"35": {"quantity": 5, "length": 225}, "36": {"quantity": 2, "length": 230}}
 *   Old format (backward compatible): {"35": 5, "36": 2}
 * @param mindestbestand - Minimum stock level threshold
 * @returns "Voller Bestand" if all sizes >= mindestbestand, "Niedriger Bestand" otherwise
 */

const calculateStatus = (
  groessenMengen: any,
  mindestbestand: number
): string => {
  if (!groessenMengen || typeof groessenMengen !== "object") {
    return "Niedriger Bestand";
  }

  const sizes = groessenMengen as Record<string, any>;
  const sizeKeys = Object.keys(sizes);

  if (sizeKeys.length === 0) {
    return "Niedriger Bestand";
  }

  // Check if any size is below mindestbestand
  for (const sizeKey of sizeKeys) {
    const sizeValue = sizes[sizeKey];
    let quantity: number;

    // Handle new format: { quantity: number, length: number }
    if (sizeValue && typeof sizeValue === "object" && "quantity" in sizeValue) {
      quantity = Number(sizeValue.quantity ?? 0);
    }
    // Handle old format: number (backward compatibility)
    else if (typeof sizeValue === "number") {
      quantity = sizeValue;
    } else {
      quantity = 0;
    }

    if (quantity < mindestbestand) {
      return "Niedriger Bestand";
    }
  }

  return "Voller Bestand";
};

/**
 * Add Status field to a single store object
 */
const addStatusToStore = (store: any) => {
  if (!store) return store;
  return {
    ...store,
    Status: calculateStatus(store.groessenMengen, store.mindestbestand),
  };
};

/**
 * Add Status field to an array of store objects
 */
const addStatusToStores = (stores: any[]) => {
  return stores.map((store) => addStatusToStore(store));
};

/* VERY IMPORTANT ALSO SHOW CUSTOMER FOR WHICH ONE IN THE HISTORY WE USED THE SIZE FOR4. 🧾 Inventory Movement History (Stock Log)Each product has its own history log showing every stock change:Incoming (e.g. deliveries)Outgoing (e.g. sales, reservations)Corrections (manual adjustments)Transfers (between storage locations)Each entry should include:Date & timeQuantity change (+X or –X)New stock levelUser or system actionOptional: Comment or reason

*/

export const createStorage = async (req: Request, res: Response) => {
  try {
    const {
      produktname,
      hersteller,
      artikelnummer,
      lagerort,
      mindestbestand,
      groessenMengen,
      purchase_price,
      selling_price,
    } = req.body;

    const userId = req.user.id;
    console.log(userId);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const missingField = [
      "produktname",
      "hersteller",
      "artikelnummer",
      "lagerort",
      "mindestbestand",
      "groessenMengen",
      "purchase_price",
      "selling_price",
    ].find((field) => !req.body[field]);

    if (missingField) {
      res.status(400).json({
        message: `${missingField} is required!`,
      });
      return;
    }

    const newStorage = await prisma.stores.create({
      data: {
        produktname,
        hersteller,
        artikelnummer,
        lagerort,
        mindestbestand,
        groessenMengen,
        purchase_price,
        selling_price,
        userId,
      },
    });

    // Add calculated Status to response
    const storageWithStatus = addStatusToStore(newStorage);

    res.status(201).json({
      success: true,
      message: "Storage created successfully",
      data: storageWithStatus,
    });
  } catch (error) {
    console.error("error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getAllMyStorage = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;

    console.log(userId);

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const totalItems = await prisma.stores.count({
      where: { user: { id: userId } },
    });

    const allStorage = await prisma.stores.findMany({
      where: { user: { id: userId } },
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(totalItems / limit);

    // Add calculated Status to all stores
    const storageWithStatus = addStatusToStores(allStorage);

    res.status(200).json({
      success: true,
      message: "All storage fetched successfully",
      data: storageWithStatus,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getSingleStorage = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const storeId = req.params.id;

    const totalItems = await prisma.stores.count({
      where: { userId },
    });

    const data = await prisma.stores.findFirst({
      where: { user: { id: userId }, id: storeId },
    });

    // Add calculated Status to store
    const storageWithStatus = addStatusToStore(data);

    res.status(200).json({
      success: true,
      message: "storage fetched successfully",
      data: storageWithStatus,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const updateStorage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const updatedStorageData = Object.fromEntries(
      Object.entries(req.body).filter(([_, value]) => value !== undefined)
    );

    // Remove Status from update data if present (it's calculated dynamically)
    delete updatedStorageData.Status;
    // { user: { id: userId }
    const updatedStorage = await prisma.stores.update({
      where: { id, user: { id: userId } },
      data: updatedStorageData,
    });

    // Add calculated Status to response
    const storageWithStatus = addStatusToStore(updatedStorage);

    res.status(200).json({
      success: true,
      message: "Storage updated successfully",
      data: storageWithStatus,
    });
  } catch (error: any) {
    console.error("updateStorage error:", error);

    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Storage not found",
      });
    }

    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const deleteStorage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    // { user: { id: userId }
    const deletedStorage = await prisma.stores.delete({
      where: { id, user: { id: userId } },
    });

    res.status(200).json({
      success: true,
      message: "Storage deleted successfully",
      data: {
        id: deletedStorage.id,
      },
    });
  } catch (error: any) {
    if (error.code === "P2025") {
      res.status(404).json({
        success: false,
        message: "Storage not found",
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getStorageChartData = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;

    const fromYearParam = req.query.fromYear as string | undefined;
    const toYearParam = req.query.toYear as string | undefined;
    const yearParam = req.query.year as string | undefined;
    const fromYear = fromYearParam ? parseInt(fromYearParam, 10) : undefined;
    const toYear = toYearParam ? parseInt(toYearParam, 10) : undefined;
    const specificYear = yearParam ? parseInt(yearParam, 10) : undefined;

    const stores = await prisma.stores.findMany({
      where: { userId },
      select: { purchase_price: true, selling_price: true, createdAt: true },
    });

    // If a specific year is requested, return monthly data for that year
    if (specificYear && !isNaN(specificYear)) {
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

      const monthToSums = new Array(12)
        .fill(null)
        .map(() => ({ einkauf: 0, verkauf: 0 }));

      for (const s of stores) {
        const d = new Date(s.createdAt);
        const y = d.getFullYear();
        if (y !== specificYear) continue;
        const m = d.getMonth(); // 0-11
        monthToSums[m].einkauf += Number(s.purchase_price || 0);
        monthToSums[m].verkauf += Number(s.selling_price || 0);
      }

      const data = monthToSums.map((sums, idx) => ({
        month: monthNames[idx],
        Einkaufspreis: Math.round(sums.einkauf),
        Verkaufspreis: Math.round(sums.verkauf),
        Gewinn: Math.round(sums.verkauf - sums.einkauf),
      }));

      return res.status(200).json({
        success: true,
        message: "Storage chart data (monthly) fetched successfully",
        year: specificYear,
        data,
      });
    }

    // Default: yearly aggregation (optionally filtered by fromYear/toYear)
    const yearToSums = new Map<string, { einkauf: number; verkauf: number }>();

    for (const s of stores) {
      const year = new Date(s.createdAt).getFullYear();
      if ((fromYear && year < fromYear) || (toYear && year > toYear)) continue;
      const key = String(year);
      const entry = yearToSums.get(key) || { einkauf: 0, verkauf: 0 };
      entry.einkauf += Number(s.purchase_price || 0);
      entry.verkauf += Number(s.selling_price || 0);
      yearToSums.set(key, entry);
    }

    const data = Array.from(yearToSums.entries())
      .map(([year, sums]) => ({
        year,
        Einkaufspreis: Math.round(sums.einkauf),
        Verkaufspreis: Math.round(sums.verkauf),
        Gewinn: Math.round(sums.verkauf - sums.einkauf),
      }))
      .sort((a, b) => Number(a.year) - Number(b.year));

    res.status(200).json({
      success: true,
      message: "Storage chart data fetched successfully",
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getStorageHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const storeId = req.params.id;

    // Pagination values
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Count total entries
    const totalItems = await prisma.storesHistory.count({
      where: { storeId },
    });

    // If no items, return empty result with totalPages = 0
    if (totalItems === 0) {
      return res.status(200).json({
        success: true,
        message: "Storage history fetched successfully",
        data: [],
        pagination: {
          totalItems: 0,
          totalPages: 0,
          currentPage: page,
          itemsPerPage: limit,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });
    }

    // Calculate total pages normally if items > 0
    const totalPages = Math.ceil(totalItems / limit);

    const history = await prisma.storesHistory.findMany({
      where: { storeId, user: { id: userId } },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
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
        order: {
          select: {
            id: true,
            totalPrice: true,
            orderStatus: true,
            createdAt: true,
            product: {
              select: {
                id: true,
                name: true,
                rohlingHersteller: true,
                artikelHersteller: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            busnessName: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Storage history fetched successfully",
      data: history,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

//  i need a group data top to low Performer = [
//   { model: 'Modell B', verkaufe: 230, umsatzanteil: 12.7 },
//   { model: 'Modell C', verkaufe: 210, umsatzanteil: 10.7 },
//   { model: 'Modell A', verkaufe: 195, umsatzanteil: 8.2 },
//   { model: 'Modell D', verkaufe: 160, umsatzanteil: 7.9 },
//   { model: 'Modell E', verkaufe: 115, umsatzanteil: 6.1 }
// ]

export const getStoragePerformer = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;

    const performerHistoary = await prisma.storesHistory.findMany({
      where: { user: { id: userId } },
      orderBy: { createdAt: "desc" },
    });

    const performerStores = await prisma.stores.findMany({
      where: { user: { id: userId } },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      success: true,
      message: "Storage performer fetched successfully",
      data: {
        performerStores,
        performerHistoary,
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
