import { Request, Response } from "express";
import fs from "fs";

import { PrismaClient } from "@prisma/client";
import { getImageUrl } from "../../../../utils/base_utl";
const prisma = new PrismaClient();

export const sendToAdminOrder_1 = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const userId = req.user?.id;

    // Validate request
    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: user not authenticated",
      });
    }

    const getField = (key: string) => {
      if (req.body[key] !== undefined) return req.body[key];

      const normalize = (str: string) =>
        str
          .replace(/Ã¶/g, "ö")
          .replace(/Ã¼/g, "ü")
          .replace(/Ã¤/g, "ä")
          .replace(/Ã\x9F/g, "ß")
          .replace(/Ã\x9C/g, "Ü")
          .replace(/Ã\x84/g, "Ä")
          .replace(/Ã\x96/g, "Ö")
          .toLowerCase();

      const normalizedKey = normalize(key);
      const foundKey = Object.keys(req.body).find(
        (k) => normalize(k) === normalizedKey
      );
      return foundKey ? req.body[foundKey] : undefined;
    };

    const orNull = (value: any) => (value !== undefined ? value : null);

    const toBoolean = (value: any): boolean | null => {
      if (value === undefined) return null;
      if (typeof value === "boolean") return value;
      if (typeof value === "string") {
        const lower = value.toLowerCase();
        return (
          lower.includes("ja") ||
          lower.includes("yes") ||
          lower === "true" ||
          value === "1"
        );
      }
      return Boolean(value);
    };

    // Helper: Parse totalPrice
    const parsePrice = (value: any): number | null => {
      if (value === undefined || value === null || value === "") return null;
      const parsed = parseFloat(value.toString());
      return isNaN(parsed) ? null : parsed;
    };

    const files = req.files as any;

    if (files) {
      console.log("Received file fields:", Object.keys(files));
    }

    const threed_model_right =
      files?.image3d_1?.[0]?.filename ||
      files?.threed_model_right?.[0]?.filename ||
      null;
    const threed_model_left =
      files?.image3d_2?.[0]?.filename ||
      files?.threed_model_left?.[0]?.filename ||
      null;
    const invoice = files?.invoice?.[0]?.filename || null;

    // Verify order exists
    let order;
    try {
      order = await prisma.massschuhe_order.findUnique({
        where: { id: orderId },
        select: { id: true },
      });
    } catch (dbError: any) {
      console.error("Database error finding order:", dbError);
      return res.status(500).json({
        success: false,
        message: "Error verifying order",
        error:
          process.env.NODE_ENV === "development" ? dbError.message : undefined,
      });
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Create custom shaft order
    let adminOrder;
    try {
      adminOrder = await prisma.custom_shafts.create({
        data: {
          massschuhe_order_id: orderId,
          partnerId: userId,
          image3d_1: threed_model_right,
          image3d_2: threed_model_left,
          invoice: invoice,
          isCompleted: false,
          catagoary: "Halbprobenerstellung",
          Bettungsdicke: orNull(getField("Bettungsdicke")),
          Haertegrad_Shore: orNull(getField("Haertegrad_Shore")),
          Fersenschale: orNull(getField("Fersenschale")),
          Laengsgewölbestütze: orNull(getField("Laengsgewölbestütze")),
          Palotte_oder_Querpalotte: orNull(
            getField("Palotte_oder_Querpalotte")
          ),
          Korrektur_der_Fußstellung: orNull(
            getField("Korrektur_der_Fußstellung")
          ),
          Zehenelemente_Details: orNull(getField("Zehenelemente_Details")),
          eine_korrektur_nötig_ist: orNull(
            getField("eine_korrektur_nötig_ist")
          ),
          Spezielles_Fußproblem: orNull(getField("Spezielles_Fußproblem")),
          Zusatzkorrektur_Absatzerhöhung: orNull(
            getField("Zusatzkorrektur_Absatzerhöhung")
          ),
          Vertiefungen_Aussparungen: orNull(
            getField("Vertiefungen_Aussparungen")
          ),
          Oberfläche_finish: orNull(getField("Oberfläche_finish")),
          Überzug_Stärke: orNull(getField("Überzug_Stärke")),
          Anmerkungen_zur_Bettung: orNull(getField("Anmerkungen_zur_Bettung")),
          Leisten_mit_ohne_Platzhalter: orNull(
            getField("Leisten_mit_ohne_Platzhalter")
          ),
          Schuhleisten_Typ: orNull(getField("Schuhleisten_Typ")),
          Material_des_Leisten: orNull(getField("Material_des_Leisten")),
          Leisten_gleiche_Länge: toBoolean(getField("Leisten_gleiche_Länge")),
          Absatzhöhe: orNull(getField("Absatzhöhe")),
          Abrollhilfe: orNull(getField("Abrollhilfe")),
          Spezielle_Fußprobleme_Leisten: orNull(
            getField("Spezielle_Fußprobleme_Leisten")
          ),
          Anmerkungen_zum_Leisten: orNull(getField("Anmerkungen_zum_Leisten")),
          totalPrice: parsePrice(getField("totalPrice")),
        },
        select: {
          id: true,
          image3d_1: true,
          image3d_2: true,
          invoice: true,
          isCompleted: true,
          catagoary: true,
          Bettungsdicke: true,
          Haertegrad_Shore: true,
          Fersenschale: true,
          Laengsgewölbestütze: true,
          Palotte_oder_Querpalotte: true,
          Korrektur_der_Fußstellung: true,
          Zehenelemente_Details: true,
          eine_korrektur_nötig_ist: true,
          Spezielles_Fußproblem: true,
          Zusatzkorrektur_Absatzerhöhung: true,
          Vertiefungen_Aussparungen: true,
          Oberfläche_finish: true,
          Überzug_Stärke: true,
          Anmerkungen_zur_Bettung: true,
          Leisten_mit_ohne_Platzhalter: true,
          Schuhleisten_Typ: true,
          Material_des_Leisten: true,
          Leisten_gleiche_Länge: true,
          Absatzhöhe: true,
          Abrollhilfe: true,
          Spezielle_Fußprobleme_Leisten: true,
          Anmerkungen_zum_Leisten: true,
          totalPrice: true,
        },
      });
    } catch (error: any) {
      console.error("Database error creating custom_shafts:", error);
      return res.status(500).json({
        success: false,
        message: "Error creating order",
        error: error.message,
      });
    }

    // Create transition record
    try {
      await prisma.maßschuhe_transitions.create({
        data: {
          massschuhe_order_id: orderId,
          partnerId: userId,
          catagoary: "Halbprobenerstellung",
          price: adminOrder.totalPrice,
          note: "Halbprobenerstellung send to admin",
        },
      });
    } catch (transitionError: any) {
      console.error("Database error creating transition:", transitionError);
      // Don't fail the whole request if transition creation fails
      console.warn(
        "Warning: Failed to create transition record, but order was created successfully"
      );
    }

    // Format image URLs
    const formatImage = (filename: string | null) =>
      filename ? getImageUrl(`/uploads/${filename}`) : null;

    return res.status(200).json({
      success: true,
      message: "Order sent to admin 1 successfully",
      data: {
        ...adminOrder,
        image3d_1: formatImage(adminOrder.image3d_1),
        image3d_2: formatImage(adminOrder.image3d_2),
        invoice: formatImage(adminOrder.invoice),
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const sendToAdminOrder_2 = async (req, res) => {
  const files = req.files as any;
  const { id } = req.user;
  const { orderId } = req.params;

  try {
    // Get order and validate
    const order = await prisma.massschuhe_order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        userId: true,
        customerId: true,
        customer: {
          select: {
            customerNumber: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if order already sent to admin 2
    const isOrderSent = await prisma.custom_shafts.findFirst({
      where: {
        massschuhe_order_id: orderId,
        catagoary: "Massschafterstellung",
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

    // Get customer from order
    if (!order.customerId) {
      return res.status(400).json({
        success: false,
        message: "Order does not have a customer associated",
      });
    }

    const {
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
      maßschaftKollektionId,

      totalPrice,
    } = req.body;

    if (!mabschaftKollektionId) {
      return res.status(400).json({
        success: false,
        message: "maßschaftKollektionId must be provided",
      });
    }

    // Validate customer and kollektion
    const [customer, kollektion] = await Promise.all([
      prisma.customers.findUnique({
        where: { id: order.customerId },
        select: { id: true },
      }),
      prisma.maßschaft_kollektion.findUnique({
        where: { id: mabschaftKollektionId },
        select: { id: true },
      }),
    ]);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    if (!kollektion) {
      return res.status(404).json({
        success: false,
        message: "Maßschaft Kollektion not found",
      });
    }

    // Prepare data object
    const shaftData: any = {
      massschuhe_order_id: orderId,
      partnerId: id,
      customerId: order.customerId,
      image3d_1: files.image3d_1?.[0]?.filename || null,
      image3d_2: files.image3d_2?.[0]?.filename || null,
      other_customer_number: order.customer?.customerNumber
        ? String(order.customer.customerNumber)
        : null,
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
      totalPrice: totalPrice ? parseFloat(totalPrice) : null,
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
      isCompleted: false,
      maßschaftKollektionId: mabschaftKollektionId,
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

    // create a transition
    await prisma.maßschuhe_transitions.create({
      data: {
        massschuhe_order_id: orderId,
        partnerId: id,
        catagoary: "Massschafterstellung",
        //totalPrice
        price: customShaft.totalPrice,
        note: "Massschafterstellung send to admin",
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
              ? getImageUrl(
                  `/uploads/${customShaft.maßschaft_kollektion.image}`
                )
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

    const {
      Konstruktionsart,
      Fersenkappe,
      Farbauswahl_Bodenkonstruktion,
      Sohlenmaterial,
      Absatz_Höhe,
      Absatz_Form,
      Abrollhilfe_Rolle,
      Laufsohle_Profil_Art,
      Sohlenstärke,
      Besondere_Hinweise,
      totalPrice,
    } = req.body;

    const order = await prisma.massschuhe_order.findUnique({
      where: { id: orderId },
    });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const adminOrder = await prisma.custom_shafts.create({
      data: {
        massschuhe_order_id: orderId,
        partnerId: id,
        invoice: invoice,
        Konstruktionsart: Konstruktionsart || null,
        Fersenkappe: Fersenkappe || null,
        Farbauswahl_Bodenkonstruktion: Farbauswahl_Bodenkonstruktion || null,
        Sohlenmaterial: Sohlenmaterial || null,
        Absatz_Höhe: Absatz_Höhe || null,
        Absatz_Form: Absatz_Form || null,
        Abrollhilfe_Rolle: Abrollhilfe_Rolle || null,
        Laufsohle_Profil_Art: Laufsohle_Profil_Art || null,
        Sohlenstärke: Sohlenstärke || null,
        Besondere_Hinweise: Besondere_Hinweise || null,
        totalPrice: totalPrice ? parseFloat(totalPrice) : null,
        isCompleted: false,
        catagoary: "Bodenkonstruktion",
      },
      select: {
        id: true,
        invoice: true,
        Konstruktionsart: true,
        Fersenkappe: true,
        Farbauswahl_Bodenkonstruktion: true,
        Sohlenmaterial: true,
        Absatz_Höhe: true,
        Absatz_Form: true,
        Abrollhilfe_Rolle: true,
        Laufsohle_Profil_Art: true,
        Sohlenstärke: true,
        Besondere_Hinweise: true,
        totalPrice: true,
        isCompleted: true,
        catagoary: true,
      },
    });

    const formattedAdminOrder = {
      id: adminOrder.id,
      invoice: adminOrder.invoice
        ? getImageUrl(`/uploads/${adminOrder.invoice}`)
        : null,
      Konstruktionsart: adminOrder.Konstruktionsart,
      Fersenkappe: adminOrder.Fersenkappe,
      Farbauswahl_Bodenkonstruktion: adminOrder.Farbauswahl_Bodenkonstruktion,
      Sohlenmaterial: adminOrder.Sohlenmaterial,
      Absatz_Höhe: adminOrder.Absatz_Höhe,
      Absatz_Form: adminOrder.Absatz_Form,
      Abrollhilfe_Rolle: adminOrder.Abrollhilfe_Rolle,
      Laufsohle_Profil_Art: adminOrder.Laufsohle_Profil_Art,
      Sohlenstärke: adminOrder.Sohlenstärke,
      Besondere_Hinweise: adminOrder.Besondere_Hinweise,
      totalPrice: adminOrder.totalPrice,
      isCompleted: adminOrder.isCompleted,
      catagoary: adminOrder.catagoary,
    };

    await prisma.maßschuhe_transitions.create({
      data: {
        massschuhe_order_id: orderId,
        partnerId: id,
        catagoary: "Bodenkonstruktion",
        price: adminOrder.totalPrice,
        note: "Bodenkonstruktion send to admin",
      },
    });

    return res.status(200).json({
      success: true,
      message: "Order sent to admin 3 successfully",
      data: formattedAdminOrder,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getAllAdminOrders = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || "";
    const status = req.query.status;
    const catagoary = req.query.catagoary;
    const skip = (page - 1) * limit;

    const whereCondition: any = {};

    const validStatuses = [
      "Bestellung_eingegangen",
      "In_Produktion",
      "Qualitätskontrolle",
      "Versandt",
      "Ausgeführt",
    ] as const;

    const validCatagoaries = [
      "Halbprobenerstellung",
      "Massschafterstellung",
      "Bodenkonstruktion",
    ] as const;

    // Safe status validation
    if (status && !validStatuses.includes(status.toString() as any)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
        validStatuses: validStatuses,
      });
    }

    // Safe catagoary validation
    if (catagoary && !validCatagoaries.includes(catagoary.toString() as any)) {
      return res.status(400).json({
        success: false,
        message: "Invalid catagoary value",
        validCatagoaries: validCatagoaries,
      });
    }

    if (status) {
      whereCondition.status = status;
    }

    if (catagoary) {
      whereCondition.catagoary = catagoary;
    }

    if (search) {
      whereCondition.OR = [
        { lederfarbe: { contains: search, mode: "insensitive" } },
        { innenfutter: { contains: search, mode: "insensitive" } },
        { schafthohe: { contains: search, mode: "insensitive" } },
        { polsterung: { contains: search, mode: "insensitive" } },
        { vestarkungen: { contains: search, mode: "insensitive" } },
        { polsterung_text: { contains: search, mode: "insensitive" } },
        { vestarkungen_text: { contains: search, mode: "insensitive" } },
        { nahtfarbe: { contains: search, mode: "insensitive" } },
        { nahtfarbe_text: { contains: search, mode: "insensitive" } },
        { lederType: { contains: search, mode: "insensitive" } },
        {
          customer: {
            OR: [
              { vorname: { contains: search, mode: "insensitive" } },
              { nachname: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
              { telefon: { contains: search, mode: "insensitive" } },
              { ort: { contains: search, mode: "insensitive" } },
              { land: { contains: search, mode: "insensitive" } },
            ],
          },
        },
        {
          maßschaft_kollektion: {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { catagoary: { contains: search, mode: "insensitive" } },
              { gender: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
            ],
          },
        },
        {
          user: {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          },
        },
      ];
    }

    const [totalCount, customShafts] = await Promise.all([
      prisma.custom_shafts.count({
        where: whereCondition,
      }),
      prisma.custom_shafts.findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          customer: {
            select: {
              id: true,
              customerNumber: true,
              vorname: true,
              nachname: true,
              email: true,
              telefon: true,
              ort: true,
              land: true,
              straße: true,
              geburtsdatum: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          maßschaft_kollektion: {
            select: {
              id: true,
              ide: true,
              name: true,
              price: true,
              image: true,
              catagoary: true,
              gender: true,
              description: true,
              createdAt: true,
              updatedAt: true,
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
      }),
    ]);

    const formattedCustomShafts = customShafts.map(({ user, ...shaft }) => ({
      ...shaft,
      image3d_1: shaft.image3d_1
        ? getImageUrl(`/uploads/${shaft.image3d_1}`)
        : null,
      image3d_2: shaft.image3d_2
        ? getImageUrl(`/uploads/${shaft.image3d_2}`)
        : null,
      customer: shaft.customer
        ? {
            ...shaft.customer,
          }
        : null,
      maßschaft_kollektion: shaft.maßschaft_kollektion
        ? {
            ...shaft.maßschaft_kollektion,
            image: shaft.maßschaft_kollektion.image
              ? getImageUrl(`/uploads/${shaft.maßschaft_kollektion.image}`)
              : null,
          }
        : null,
      partner: user
        ? {
            ...user,
            image: user.image ? getImageUrl(`/uploads/${user.image}`) : null,
          }
        : null,
    }));

    // Calculate pagination values
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json({
      success: true,
      message: "Custom shafts fetched successfully",
      data: formattedCustomShafts,
      pagination: {
        totalItems: totalCount,
        totalPages: totalPages,
        currentPage: page,
        itemsPerPage: limit,
        hasNextPage: hasNextPage,
        hasPrevPage: hasPrevPage,
      },
    });
  } catch (error: any) {
    console.error("Get Custom Shafts Error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong while fetching custom shafts",
      error: error.message,
    });
  }
};
