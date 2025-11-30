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

// export const updateStorage = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;
//     const userId = req.user.id;
//     if (!userId) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }
//     const updatedStorageData = Object.fromEntries(
//       Object.entries(req.body).filter(([_, value]) => value !== undefined)
//     );

//     // Remove Status from update data if present (it's calculated dynamically)
//     delete updatedStorageData.Status;
//     // { user: { id: userId }
//     const updatedStorage = await prisma.stores.update({
//       where: { id, user: { id: userId } },
//       data: updatedStorageData,
//     });

//     // Add calculated Status to response
//     const storageWithStatus = addStatusToStore(updatedStorage);

//     res.status(200).json({
//       success: true,
//       message: "Storage updated successfully",
//       data: storageWithStatus,
//     });
//   } catch (error: any) {
//     console.error("updateStorage error:", error);

//     if (error.code === "P2025") {
//       return res.status(404).json({
//         success: false,
//         message: "Storage not found",
//       });
//     }

//     res.status(500).json({
//       success: false,
//       message: "Something went wrong",
//       error: error instanceof Error ? error.message : "Unknown error",
//     });
//   }
// };

export const updateStorage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const partnerId = req.user.id;

    if (!partnerId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Remove undefined fields
    const updatedData = Object.fromEntries(
      Object.entries(req.body).filter(([_, v]) => v !== undefined)
    );

    // Status = auto generated, never user updated
    delete updatedData.Status;

    // Fetch old store data
    const oldStore = await prisma.stores.findUnique({
      where: { id },
    });

    if (!oldStore || oldStore.userId !== partnerId) {
      return res
        .status(404)
        .json({ success: false, message: "Storage not found" });
    }

    // Update the store
    const newStore = await prisma.stores.update({
      where: { id },
      data: updatedData,
    });

    // Recalculate status
    const storeWithStatus = addStatusToStore(newStore);

    // -------------------------------------------------------------------
    // ⭐ DETAILED CHANGE DETECTION (deep comparison)
    // -------------------------------------------------------------------
    const changes: string[] = [];

    function compareValues(prefix: string, oldVal: any, newVal: any) {
      // Primitive values
      if (typeof oldVal !== "object" || oldVal === null || newVal === null) {
        if (oldVal !== newVal) {
          changes.push(`${prefix}: ${oldVal} → ${newVal}`);
        }
        return;
      }
    
      // Handle groessenMengen separately
      if (prefix === "groessenMengen") {
        for (const size of Object.keys({ ...oldVal, ...newVal })) {
          const oldSize = oldVal[size];
          const newSize = newVal[size];
    
          if (!oldSize || !newSize) continue;
    
          if (oldSize.length !== newSize.length) {
            changes.push(`groessenMengen.${size}.length: ${oldSize.length} → ${newSize.length}`);
          }
          if (oldSize.quantity !== newSize.quantity) {
            changes.push(`groessenMengen.${size}.quantity: ${oldSize.quantity} → ${newSize.quantity}`);
          }
        }
        return;
      }
    
      // Generic deep object comparison (other objects)
      for (const key of Object.keys({ ...oldVal, ...newVal })) {
        compareValues(`${prefix}.${key}`, oldVal[key], newVal[key]);
      }
    }
    
    // Only check the fields that were updated
    for (const key of Object.keys(updatedData)) {
      const oldVal = (oldStore as any)[key];
      const newVal = (newStore as any)[key];
    
      compareValues(key, oldVal, newVal);
    }
    
    // Create history entry
    await prisma.storesHistory.create({
      data: {
        storeId: id,
        changeType: "updateStock",
        partnerId,
        reason: "Store updated",
        text: changes.length > 0 ? changes.join(", ") : "No main changes detected",
        status: "STOCK_UPDATE",
      },
    });
    
    // -------------------------------------------------------------------

    return res.status(200).json({
      success: true,
      message: "Storage updated successfully",
      data: storeWithStatus,
    });
  } catch (error: any) {
    console.error("updateStorage error:", error);

    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Storage not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
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

    // Get all stores with their current stock quantities
    const stores = await prisma.stores.findMany({
      where: { userId },
      select: {
        groessenMengen: true,
        purchase_price: true,
        selling_price: true,
      },
    });

    // Initialize totals
    let totalEinkaufspreis = 0;
    let totalVerkaufspreis = 0;

    // Calculate inventory value for each product
    for (const store of stores) {
      const groessenMengen = store.groessenMengen as Record<string, any>;
      const purchasePrice = Number(store.purchase_price || 0);
      const sellingPrice = Number(store.selling_price || 0);

      // Calculate total quantity for this product
      let totalQuantity = 0;

      if (groessenMengen && typeof groessenMengen === "object") {
        const sizeKeys = Object.keys(groessenMengen);

        for (const sizeKey of sizeKeys) {
          const sizeValue = groessenMengen[sizeKey];
          let quantity: number;

          // Handle new format: { quantity: number, length: number }
          if (
            sizeValue &&
            typeof sizeValue === "object" &&
            "quantity" in sizeValue
          ) {
            quantity = Number(sizeValue.quantity ?? 0);
          }
          // Handle old format: number (backward compatibility)
          else if (typeof sizeValue === "number") {
            quantity = sizeValue;
          } else {
            quantity = 0;
          }

          totalQuantity += quantity;
        }
      }

      // Calculate values for this product
      const productEinkaufspreis = totalQuantity * purchasePrice;
      const productVerkaufspreis = totalQuantity * sellingPrice;

      // Add to totals
      totalEinkaufspreis += productEinkaufspreis;
      totalVerkaufspreis += productVerkaufspreis;
    }

    // Calculate profit
    const totalGewinn = totalVerkaufspreis - totalEinkaufspreis;

    // Return current inventory value (single aggregated result)
    const data = {
      Einkaufspreis: Math.round(totalEinkaufspreis),
      Verkaufspreis: Math.round(totalVerkaufspreis),
      Gewinn: Math.round(totalGewinn),
    };

    res.status(200).json({
      success: true,
      message: "Storage chart data (current inventory value) fetched successfully",
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
            // telefonnummer: true,
            telefon: true,
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

export const getStoragePerformer = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const type = (req.query.type as string) || "top"; // "top" or "low"

    // Get all stores for this partner first
    const allStores = await prisma.stores.findMany({
      where: {
        userId: userId,
      },
      select: {
        id: true,
        produktname: true,
      },
    });

    // Initialize all stores with 0 values
    const modelStats = new Map<string, { verkaufe: number; umsatz: number }>();

    // Initialize all stores (even those without sales history)
    for (const store of allStores) {
      if (!modelStats.has(store.produktname)) {
        modelStats.set(store.produktname, { verkaufe: 0, umsatz: 0 });
      }
    }

    // Get all sales history for this partner
    const salesHistory = await prisma.storesHistory.findMany({
      where: {
        partnerId: userId,
        changeType: "sales",
        orderId: { not: null }, // Only include entries with orders
        store: {
          userId: userId, // Ensure store belongs to this partner
        },
      },
      include: {
        store: {
          select: {
            id: true,
            produktname: true,
          },
        },
        order: {
          select: {
            id: true,
            totalPrice: true,
          },
        },
      },
    });

    // Update stats with actual sales data
    for (const history of salesHistory) {
      if (!history.store || !history.order) continue;

      const modelName = history.store.produktname;
      const revenue = Number(history.order.totalPrice || 0);

      // Ensure the model exists in the map (should already exist, but safety check)
      if (!modelStats.has(modelName)) {
        modelStats.set(modelName, { verkaufe: 0, umsatz: 0 });
      }

      const stats = modelStats.get(modelName)!;
      stats.verkaufe += 1; // Count each sale
      stats.umsatz += revenue; // Sum revenue
    }

    // Calculate total revenue for percentage calculation
    const totalRevenue = Array.from(modelStats.values()).reduce(
      (sum, stats) => sum + stats.umsatz,
      0
    );

    // Find maximum verkaufe for progress bar calculation
    const verkaufeValues = Array.from(modelStats.values()).map(
      (stats) => stats.verkaufe
    );
    const maxVerkaufe =
      verkaufeValues.length > 0 ? Math.max(...verkaufeValues, 1) : 1; // Use 1 as minimum to avoid division by zero

    // Convert to array format and calculate revenue share and progress
    const performers = Array.from(modelStats.entries()).map(
      ([model, stats]) => ({
        model,
        verkaufe: stats.verkaufe,
        umsatzanteil:
          totalRevenue > 0
            ? Number(((stats.umsatz / totalRevenue) * 100).toFixed(1))
            : 0,
        progress:
          maxVerkaufe > 0
            ? Number(((stats.verkaufe / maxVerkaufe) * 100).toFixed(1))
            : 0, // Progress bar percentage (0-100)
      })
    );

    // Sort based on type
    if (type === "low") {
      // Low performers: sort by verkaufe ascending
      performers.sort((a, b) => a.verkaufe - b.verkaufe);
    } else {
      // Top performers: sort by verkaufe descending
      performers.sort((a, b) => b.verkaufe - a.verkaufe);
    }

    res.status(200).json({
      success: true,
      message: `Storage ${type} performer fetched successfully`,
      type: type,
      data: performers,
    });
  } catch (error) {
    console.error("getStoragePerformer error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
