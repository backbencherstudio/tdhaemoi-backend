import { Request, Response } from "express";
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

export const getAllVersorgungen = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, status, diagnosis_status } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);

    if (isNaN(pageNumber) || isNaN(limitNumber)) {
      return res.status(400).json({
        success: false,
        message: "Invalid type page or limit",
      });
    }

    const filters: Prisma.VersorgungenWhereInput = {
      createdBy: req.user.id,
    };

    if (status) {
      filters.status = status as Prisma.VersorgungenWhereInput["status"];
    }

    if (typeof diagnosis_status === "string" && diagnosis_status.length) {
      filters.diagnosis_status =
        diagnosis_status as Prisma.VersorgungenWhereInput["diagnosis_status"];
    }

    const totalCount = await prisma.versorgungen.count({
      where: filters,
    });

    const versorgungenList = await prisma.versorgungen.findMany({
      where: filters,
      skip: (pageNumber - 1) * limitNumber,
      take: limitNumber,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        store: {
          select: {
            groessenMengen: true,
          },
        },
      },
    });

    const formattedVersorgungen = versorgungenList.map(
      ({ store, ...rest }) => ({
        ...rest,
        groessenMengen: store?.groessenMengen ?? null,
      })
    );

    const totalPages = Math.ceil(totalCount / limitNumber);

    res.status(200).json({
      success: true,
      message: "Versorgungen fetched successfully",
      data: formattedVersorgungen,
      pagination: {
        totalItems: totalCount,
        totalPages,
        currentPage: pageNumber,
        itemsPerPage: limitNumber,
      },
    });
  } catch (error) {
    console.error("Get All Versorgungen error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

const normalizeMaterialInput = (input: unknown): string[] => {
  if (Array.isArray(input)) {
    return input
      .map((item) => (typeof item === "string" ? item.trim() : String(item)))
      .filter((item) => item.length > 0);
  }

  if (typeof input === "string") {
    return input
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }

  return [];
};

export const createVersorgungen = async (req: Request, res: Response) => {
  try {
    const {
      name,
      rohlingHersteller,
      artikelHersteller,
      versorgung,
      material,
      langenempfehlung,
      status,
      diagnosis_status,
      storeId,
    } = req.body;

    const userId = req.user.id;

    const missingField = [
      "name",
      "rohlingHersteller",
      "artikelHersteller",
      "versorgung",
      "material",
      "status",
      "storeId",
    ].find((field) => !req.body[field]);

    if (missingField) {
      return res.status(400).json({
        success: false,
        message: `${missingField} is required!`,
      });
    }

    // Validate the status
    const validStatuses = [
      "Alltagseinlagen",
      "Sporteinlagen",
      "Businesseinlagen",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Valid values are: ${validStatuses.join(
          ", "
        )}`,
      });
    }

    // Validate diagnosis_status if provided
    if (diagnosis_status) {
      const validDiagnosisStatuses = [
        "HAMMERZEHEN_KRALLENZEHEN",
        "MORTON_NEUROM",
        "FUSSARTHROSE",
        "STRESSFRAKTUREN_IM_FUSS",
        "DIABETISCHES_FUSSSYNDROM",
        "HOHLFUSS",
        "KNICKFUSS",
        "KNICK_SENKFUSS",
        "HALLUX_VALGUS",
        "HALLUX_RIGIDUS",
        "PLANTARFASZIITIS",
        "FERSENSPORN",
        "SPREIZFUSS",
        "SENKFUSS",
        "PLATTFUSS",
      ];

      if (!validDiagnosisStatuses.includes(diagnosis_status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid diagnosis_status. Valid values are: ${validDiagnosisStatuses.join(
            ", "
          )}`,
        });
      }
    }

    const normalizedMaterial = normalizeMaterialInput(material);

    if (normalizedMaterial.length === 0) {
      return res.status(400).json({
        success: false,
        message: "material must contain at least one value",
      });
    }

    const versorgungenData: Prisma.VersorgungenCreateInput = {
      name,
      rohlingHersteller,
      artikelHersteller,
      versorgung,
      material: normalizedMaterial,
      langenempfehlung: langenempfehlung ?? Prisma.JsonNull,
      status,
      diagnosis_status: diagnosis_status || null,
      createdBy: req.user.id,
      store: storeId
        ? {
            connect: {
              id: storeId,
            },
          }
        : undefined,
    };

    const newVersorgungen = await prisma.versorgungen.create({
      data: versorgungenData,
      select: {
        id: true,
        name: true,
        rohlingHersteller: true,
        artikelHersteller: true,
        versorgung: true,
        material: true,
        langenempfehlung: true,
        status: true,
        diagnosis_status: true,
        createdAt: true,
        updatedAt: true,
        storeId: true,
        store: {
          select: {
            groessenMengen: true,
          },
        },
      },
    });

    const { store: newVersorgungenStore, ...newVersorgungenRest } =
      newVersorgungen;
    const formattedResponse = {
      ...newVersorgungenRest,
      groessenMengen: newVersorgungenStore?.groessenMengen ?? null,
    };

    res.status(201).json({
      success: true,
      message: "Versorgungen created successfully",
      data: formattedResponse,
    });
  } catch (error) {
    console.error("Create Versorgungen error:", error);
    res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went wrong",
      error: error.message,
    });
  }
};

export const patchVersorgungen = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existingVersorgungen = await prisma.versorgungen.findFirst({
      where: { id, createdBy: req.user.id },
    });

    if (!existingVersorgungen) {
      return res.status(404).json({
        success: false,
        message: "Versorgungen not found",
      });
    }

    const { storeId, material: materialInput, ...rest } = req.body;

    const normalizedMaterial =
      materialInput !== undefined
        ? normalizeMaterialInput(materialInput)
        : undefined;

    if (materialInput !== undefined && normalizedMaterial?.length === 0) {
      return res.status(400).json({
        success: false,
        message: "material must contain at least one value when provided",
      });
    }

    const updatedVersorgungenData: Prisma.VersorgungenUpdateInput = {
      ...rest,
      ...(normalizedMaterial !== undefined
        ? { material: normalizedMaterial }
        : {}),
      updatedBy: req.user.id,
      store:
        storeId !== undefined
          ? storeId
            ? {
                connect: {
                  id: storeId,
                },
              }
            : {
                disconnect: true,
              }
          : undefined,
    };

    const updatedVersorgungen = await prisma.versorgungen.update({
      where: { id },
      data: updatedVersorgungenData,
      include: {
        store: {
          select: {
            groessenMengen: true,
          },
        },
      },
    });

    const { store: updatedVersorgungenStore, ...updatedVersorgungenRest } =
      updatedVersorgungen;

    res.status(200).json({
      success: true,
      message: "Versorgungen updated successfully",
      data: {
        ...updatedVersorgungenRest,
        groessenMengen: updatedVersorgungenStore?.groessenMengen ?? null,
      },
    });
  } catch (error) {
    console.error("Patch Versorgungen error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

export const deleteVersorgungen = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existingVersorgungen = await prisma.versorgungen.findFirst({
      where: { id, createdBy: req.user.id },
    });

    if (!existingVersorgungen) {
      return res.status(404).json({
        success: false,
        message: "Versorgungen not found",
      });
    }

    await prisma.versorgungen.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: "Versorgungen deleted successfully",
    });
  } catch (error) {
    console.error("Delete Versorgungen error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

export const getVersorgungenByDiagnosis = async (
  req: Request,
  res: Response
) => {
  try {
    const { diagnosis_status } = req.params;
    const { page = 1, limit = 10, status } = req.query;
    const partnerId = req.user.id;

    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);

    if (isNaN(pageNumber) || isNaN(limitNumber)) {
      return res.status(400).json({
        success: false,
        message: "Invalid type page or limit",
      });
    }

    // Validate diagnosis_status
    const validDiagnosisStatuses = [
      "HAMMERZEHEN_KRALLENZEHEN",
      "MORTON_NEUROM",
      "FUSSARTHROSE",
      "STRESSFRAKTUREN_IM_FUSS",
      "DIABETISCHES_FUSSSYNDROM",
      "HOHLFUSS",
      "KNICKFUSS",
      "KNICK_SENKFUSS",
      "HALLUX_VALGUS",
      "HALLUX_RIGIDUS",
      "PLANTARFASZIITIS",
      "FERSENSPORN",
      "SPREIZFUSS",
      "SENKFUSS",
      "PLATTFUSS",
    ];

    if (!validDiagnosisStatuses.includes(diagnosis_status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid diagnosis_status. Valid values are: ${validDiagnosisStatuses.join(
          ", "
        )}`,
      });
    }

    const filters: any = {
      diagnosis_status: diagnosis_status,
    };

    if (status) {
      filters.status = status;
    }

    const totalCount = await prisma.versorgungen.count({
      where: filters,
    });

    //restectade partner id
    const versorgungenList = await prisma.versorgungen.findMany({
      where: { ...filters, createdBy: partnerId },
      skip: (pageNumber - 1) * limitNumber,
      take: limitNumber,
      orderBy: {
        createdAt: "desc",
      },
    });

    const totalPages = Math.ceil(totalCount / limitNumber);

    res.status(200).json({
      success: true,
      message: `Versorgungen for ${diagnosis_status} fetched successfully`,
      data: versorgungenList,
      pagination: {
        totalItems: totalCount,
        totalPages,
        currentPage: pageNumber,
        itemsPerPage: limitNumber,
      },
      diagnosis_status: diagnosis_status,
    });
  } catch (error) {
    console.error("Get Versorgungen by Diagnosis error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

export const getSingleVersorgungen = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const versorgungen = await prisma.versorgungen.findUnique({
      where: { id },
    });
    
    if (!versorgungen) {
      return res.status(404).json({
        success: false,
        message: "Versorgungen not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Versorgungen fetched successfully",
      data: versorgungen,
    });
  } catch (error) {
    console.error("Get Single Versorgungen error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};
