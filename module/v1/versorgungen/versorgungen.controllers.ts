import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { log } from "console";

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

    const filters: any = {};
 
    if (status) {
      filters.status = status;
    }

    // Handle diagnosis_status filter
    if (diagnosis_status) {
      filters.diagnosis_status = diagnosis_status;
    } else {
      // If no diagnosis_status specified, only show items with NULL diagnosis_status
      filters.diagnosis_status = null;
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
    });

    const totalPages = Math.ceil(totalCount / limitNumber);

    res.status(200).json({
      success: true,
      message: "Versorgungen fetched successfully",
      data: versorgungenList,
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
      storeId
    } = req.body;

    const missingField = [
      "name",
      "rohlingHersteller",
      "artikelHersteller",
      "versorgung",
      "material",
      "langenempfehlung",
      "status",
      "storeId"
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
        "HAMMERZEHEN_KRALLENZEHEN", "MORTON_NEUROM", "FUSSARTHROSE", 
        "STRESSFRAKTUREN_IM_FUSS", "DIABETISCHES_FUSSSYNDROM", "HOHLFUSS",
        "KNICKFUSS", "KNICK_SENKFUSS", "HALLUX_VALGUS", "HALLUX_RIGIDUS",
        "PLANTARFASZIITIS", "FERSENSPORN", "SPREIZFUSS", "SENKFUSS", "PLATTFUSS"
      ];
      
      if (!validDiagnosisStatuses.includes(diagnosis_status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid diagnosis_status. Valid values are: ${validDiagnosisStatuses.join(", ")}`,
        });
      }
    }

    const versorgungenData = {
      name,
      rohlingHersteller,
      artikelHersteller,
      versorgung,
      material,
      langenempfehlung,
      status,
      diagnosis_status: diagnosis_status || null,
      createdBy: req.user.id,
      storeId
    };

    const newVersorgungen = await prisma.versorgungen.create({
      data: versorgungenData,
    });

    res.status(201).json({
      success: true,
      message: "Versorgungen created successfully",
      data: newVersorgungen,
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

    const existingVersorgungen = await prisma.versorgungen.findUnique({
      where: { id },
    });

    if (!existingVersorgungen) {
      return res.status(404).json({
        success: false,
        message: "Versorgungen not found",
      });
    }


    const updatedVersorgungenData = Object.fromEntries(
      Object.entries(req.body).filter(([key, value]) => value !== undefined)
    );

 
    updatedVersorgungenData.updatedBy = req.user.id;

    const updatedVersorgungen = await prisma.versorgungen.update({
      where: { id },
      data: updatedVersorgungenData,
    });

    console.log(updatedVersorgungenData);

    res.status(200).json({
      success: true,
      message: "Versorgungen updated successfully",
      data: updatedVersorgungen,
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

    const existingVersorgungen = await prisma.versorgungen.findUnique({
      where: { id },
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

export const getVersorgungenByDiagnosis = async (req: Request, res: Response) => {
  try {
    const { diagnosis_status } = req.params;
    const { page = 1, limit = 10, status } = req.query;

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
      "HAMMERZEHEN_KRALLENZEHEN", "MORTON_NEUROM", "FUSSARTHROSE", 
      "STRESSFRAKTUREN_IM_FUSS", "DIABETISCHES_FUSSSYNDROM", "HOHLFUSS",
      "KNICKFUSS", "KNICK_SENKFUSS", "HALLUX_VALGUS", "HALLUX_RIGIDUS",
      "PLANTARFASZIITIS", "FERSENSPORN", "SPREIZFUSS", "SENKFUSS", "PLATTFUSS"
    ];

    if (!validDiagnosisStatuses.includes(diagnosis_status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid diagnosis_status. Valid values are: ${validDiagnosisStatuses.join(", ")}`,
      });
    }

    const filters: any = {
      diagnosis_status: diagnosis_status
    };
 
    if (status) {
      filters.status = status;
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
      diagnosis_status: diagnosis_status
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
