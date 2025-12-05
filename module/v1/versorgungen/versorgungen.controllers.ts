import { Request, Response } from "express";
import { PrismaClient, Prisma } from "@prisma/client";
import path from "path";
import fs from "fs";
import { getImageUrl } from "../../../utils/base_utl";

const prisma = new PrismaClient();

export const getAllVersorgungen = async (req: Request, res: Response) => {
  try {

    // lalso i need status this status is from supplyStatus table status
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
      partnerId: req.user.id,
    };

    if (status) {
      filters.supplyStatus = { name: status as string };
    }

   

    if (typeof diagnosis_status === "string" && diagnosis_status.length) {
      filters.diagnosis_status =
        diagnosis_status as Prisma.VersorgungenWhereInput["diagnosis_status"];
    }

    const totalCount = await prisma.versorgungen.count({ where: filters });

    const versorgungenList = await prisma.versorgungen.findMany({
      where: filters,
      skip: (pageNumber - 1) * limitNumber,
      take: limitNumber,
      orderBy: { createdAt: "desc" },
      include: {
        store: {
          select: {
            groessenMengen: true,
          },
        },
        supplyStatus: {
          select: {
            name: true,
            price: true,
            image: true,
          },
        },
      },
    });

    const formattedVersorgungen = versorgungenList.map(
      ({ store, ...rest }) => ({
        ...rest,
        groessenMengen: store?.groessenMengen ?? null,
        supplyStatus: {
          name: rest.supplyStatus?.name ?? null,
          price: rest.supplyStatus?.price ?? null,
          image: rest.supplyStatus?.image ? getImageUrl(`/uploads/${rest.supplyStatus.image}`) : null,
        }
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

// export const createVersorgungen = async (req: Request, res: Response) => {
//   try {
//     const {
//       name,
//       rohlingHersteller,
//       artikelHersteller,
//       versorgung,
//       material,
//       langenempfehlung,
//       supplyStatusId,
//       diagnosis_status,
//       storeId,
//     } = req.body;

//     const userId = req.user.id;

//     const missingField = [
//       "name",
//       "rohlingHersteller",
//       "artikelHersteller",
//       "versorgung",
//       "material",
//       "supplyStatusId",
//       "storeId",
//     ].find((field) => !req.body[field]);

//     if (missingField) {
//       return res.status(400).json({
//         success: false,
//         message: `${missingField} is required!`,
//       });
//     }

//     // // Validate the status
//     // const validStatuses = [
//     //   "Alltagseinlagen",
//     //   "Sporteinlagen",
//     //   "Businesseinlagen",
//     // ];
//     // if (!validStatuses.includes(status)) {
//     //   return res.status(400).json({
//     //     success: false,
//     //     message: `Invalid status. Valid values are: ${validStatuses.join(
//     //       ", "
//     //     )}`,
//     //   });
//     // }

//     // Validate diagnosis_status if provided
//     if (diagnosis_status) {
//       const validDiagnosisStatuses = [
//         "HAMMERZEHEN_KRALLENZEHEN",
//         "MORTON_NEUROM",
//         "FUSSARTHROSE",
//         "STRESSFRAKTUREN_IM_FUSS",
//         "DIABETISCHES_FUSSSYNDROM",
//         "HOHLFUSS",
//         "KNICKFUSS",
//         "KNICK_SENKFUSS",
//         "HALLUX_VALGUS",
//         "HALLUX_RIGIDUS",
//         "PLANTARFASZIITIS",
//         "FERSENSPORN",
//         "SPREIZFUSS",
//         "SENKFUSS",
//         "PLATTFUSS",
//       ];

//       if (!validDiagnosisStatuses.includes(diagnosis_status)) {
//         return res.status(400).json({
//           success: false,
//           message: `Invalid diagnosis_status. Valid values are: ${validDiagnosisStatuses.join(
//             ", "
//           )}`,
//         });
//       }
//     }

//     const normalizedMaterial = normalizeMaterialInput(material);

//     if (normalizedMaterial.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "material must contain at least one value",
//       });
//     }

//     const versorgungenData: Prisma.VersorgungenCreateInput = {
//       name,
//       rohlingHersteller,
//       artikelHersteller,
//       versorgung,
//       material: normalizedMaterial,
//       langenempfehlung: langenempfehlung ?? Prisma.JsonNull,
//       supplyStatus: supplyStatusId
//         ? {
//             connect: {
//               id: supplyStatusId,
//             },
//           }
//         : undefined,
//       diagnosis_status: diagnosis_status || null,
//       createdBy: req.user.id,
//       store: storeId
//         ? {
//             connect: {
//               id: storeId,
//             },
//           }
//         : undefined,
//     };

//     const newVersorgungen = await prisma.versorgungen.create({
//       data: versorgungenData,
//       select: {
//         id: true,
//         name: true,
//         rohlingHersteller: true,
//         artikelHersteller: true,
//         versorgung: true,
//         material: true,
//         langenempfehlung: true,
//         // status: true,
//         diagnosis_status: true,
//         createdAt: true,
//         updatedAt: true,
//         storeId: true,
//         supplyStatus: true,
//         store: {
//           select: {
//             groessenMengen: true,
//           },
//         },
//       },
//     });

//     const { store: newVersorgungenStore, supplyStatus: newVersorgungenSupplyStatus, ...newVersorgungenRest } =
//       newVersorgungen;
//     const formattedResponse = {
//       ...newVersorgungenRest,
//       groessenMengen: newVersorgungenStore?.groessenMengen ?? null,
//       supplyStatus: newVersorgungenSupplyStatus ?? null,
//     };

//     res.status(201).json({
//       success: true,
//       message: "Versorgungen created successfully",
//       data: formattedResponse,
//     });
//   } catch (error) {
//     console.error("Create Versorgungen error:", error);
//     res.status(500).json({
//       success: false,
//       message: error.message ? error.message : "Something went wrong",
//       error: error.message,
//     });
//   }
// };

// export const createVersorgungen = async (req: Request, res: Response) => {
//   try {
//     const {
//       name,
//       rohlingHersteller,
//       artikelHersteller,
//       versorgung,
//       material,
//       langenempfehlung,
//       supplyStatusId,
//       diagnosis_status,
//       storeId,
//     } = req.body;

//     // Required fields validation
//     const requiredFields = {
//       name,
//       rohlingHersteller,
//       artikelHersteller,
//       versorgung,
//       material,
//       supplyStatusId,
//       storeId,
//     };

//     const missingField = Object.entries(requiredFields)
//       .find(([key, value]) => !value)?.[0];

//     if (missingField) {
//       return res.status(400).json({
//         success: false,
//         message: `${missingField} is required!`,
//       });
//     }

//     // Diagnosis status validation
//     const validDiagnosisStatuses = [
//       "HAMMERZEHEN_KRALLENZEHEN",
//       "MORTON_NEUROM",
//       "FUSSARTHROSE",
//       "STRESSFRAKTUREN_IM_FUSS",
//       "DIABETISCHES_FUSSSYNDROM",
//       "HOHLFUSS",
//       "KNICKFUSS",
//       "KNICK_SENKFUSS",
//       "HALLUX_VALGUS",
//       "HALLUX_RIGIDUS",
//       "PLANTARFASZIITIS",
//       "FERSENSPORN",
//       "SPREIZFUSS",
//       "SENKFUSS",
//       "PLATTFUSS",
//     ];

//     if (diagnosis_status && !validDiagnosisStatuses.includes(diagnosis_status)) {
//       return res.status(400).json({
//         success: false,
//         message: `Invalid diagnosis_status. Valid values are: ${validDiagnosisStatuses.join(", ")}`,
//       });
//     }

//     // Material normalization and validation
//     const normalizedMaterial = normalizeMaterialInput(material);
//     if (normalizedMaterial.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "material must contain at least one value",
//       });
//     }

//     // Create Versorgungen
//     const newVersorgungen = await prisma.versorgungen.create({
//       data: {
//         name,
//         rohlingHersteller,
//         artikelHersteller,
//         versorgung,
//         material: normalizedMaterial,
//         langenempfehlung: langenempfehlung ?? Prisma.JsonNull,
//         diagnosis_status: diagnosis_status || null,
//         createdBy: req.user.id,
//         supplyStatus: {
//           connect: { id: supplyStatusId }
//         },
//         store: {
//           connect: { id: storeId }
//         },
//       },
//       select: {
//         id: true,
//         name: true,
//         rohlingHersteller: true,
//         artikelHersteller: true,
//         versorgung: true,
//         material: true,
//         langenempfehlung: true,
//         diagnosis_status: true,
//         createdAt: true,
//         updatedAt: true,
//         storeId: true,
//         supplyStatus: true,
//         store: {
//           select: {
//             groessenMengen: true,
//           },
//         },
//       },
//     });

//     // Format response
//     const response = {
//       ...newVersorgungen,
//       groessenMengen: newVersorgungen.store?.groessenMengen ?? null,
//     };

//     // Remove nested store from response since we extracted groessenMengen
//     delete response.store;

//     res.status(201).json({
//       success: true,
//       message: "Versorgungen created successfully",
//       data: response,
//     });

//   } catch (error) {
//     console.error("Create Versorgungen error:", error);

//     res.status(500).json({
//       success: false,
//       message: error.message || "Something went wrong",
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined,
//     });
//   }
// };

export const createVersorgungen = async (req: Request, res: Response) => {
  try {
    const {
      name,
      rohlingHersteller,
      artikelHersteller,
      versorgung,
      material,
      // langenempfehlung,
      supplyStatusId,
      diagnosis_status,
      storeId,
    } = req.body;

    const partnerId = req.user.id;

    const requiredFields = {
      name,
      rohlingHersteller,
      artikelHersteller,
      versorgung,
      material,
      supplyStatusId,
      storeId,
    };
    const missingField = Object.entries(requiredFields).find(
      ([key, value]) => !value
    )?.[0];
    if (missingField) {
      return res.status(400).json({
        success: false,
        message: `${missingField} is required!`,
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
    if (
      diagnosis_status &&
      !validDiagnosisStatuses.includes(diagnosis_status)
    ) {
      return res.status(400).json({
        success: false,
        message: `Invalid diagnosis_status. Valid values are: ${validDiagnosisStatuses.join(
          ", "
        )}`,
      });
    }

    const normalizedMaterial = normalizeMaterialInput(material);

    if (normalizedMaterial.length === 0) {
      return res.status(400).json({
        success: false,
        message: "material must contain at least one value",
      });
    }

    //valid supplyStatusId
    const existingSupplyStatus = await prisma.supplyStatus.findUnique({
      where: { id: supplyStatusId },
      select: {
        id: true,
      },
    });

    if (!existingSupplyStatus) {
      return res.status(400).json({
        success: false,
        message: "supplyStatus not found",
      });
    }

    //valid storeId
    const existingStore = await prisma.stores.findUnique({
      where: { id: storeId },
    });
    if (!existingStore) {
      return res.status(400).json({
        success: false,
        message: "store not found",
      });
    }

    //check partner id is valid
    const existingPartner = await prisma.user.findUnique({
      where: { id: partnerId },
    });
    if (!existingPartner) {
      return res.status(400).json({
        success: false,
        message: "partner not found",
      });
    }

    if (existingStore.userId !== partnerId) {
      return res.status(400).json({
        success: false,
        message: "store not found",
      });
    }

    //create versorgungen
    const newVersorgungen = await prisma.versorgungen.create({
      data: {
        name,
        rohlingHersteller,
        artikelHersteller,
        versorgung,
        material: normalizedMaterial,

        diagnosis_status: diagnosis_status || null,
        partner: {
          connect: { id: partnerId },
        },
        supplyStatus: {
          connect: { id: supplyStatusId },
        },
        store: { connect: { id: storeId } },
      },
      select: {
        id: true,
        name: true,
        rohlingHersteller: true,
        artikelHersteller: true,
        versorgung: true,
        material: true,
        diagnosis_status: true,
        supplyStatus: {
          select: {
            name: true,
            price: true,
            image: true,
          },
        },
        store: {
          select: {
            groessenMengen: true,
          },
        },
      },
    });

    const formattedVersorgungen = {
      ...newVersorgungen,
      supplyStatus: newVersorgungen.supplyStatus
        ? {
            ...newVersorgungen.supplyStatus,
            image: newVersorgungen.supplyStatus.image
              ? getImageUrl(`/uploads/${newVersorgungen.supplyStatus.image}`)
              : null,
          }
        : null,
      store: newVersorgungen.store
        ? newVersorgungen.store.groessenMengen ?? null
        : null,
    };

    res.status(201).json({
      success: true,
      message: "Versorgungen created successfully",
      data: formattedVersorgungen,
    });
  } catch (error) {
    console.error("Create Versorgungen error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// export const patchVersorgungen = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;
//     const partnerId = req.user.id;

//     const existingVersorgungen = await prisma.versorgungen.findFirst({
//       where: { id, partnerId: partnerId },
//     });

//     if (!existingVersorgungen) {
//       return res.status(404).json({
//         success: false,
//         message: "Versorgungen not found",
//       });
//     }

//     const { storeId, material: materialInput, ...rest } = req.body;

//     const normalizedMaterial =
//       materialInput !== undefined
//         ? normalizeMaterialInput(materialInput)
//         : undefined;

//     if (materialInput !== undefined && normalizedMaterial?.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "material must contain at least one value when provided",
//       });
//     }

//     const updatedVersorgungenData: Prisma.VersorgungenUpdateInput = {
//       ...rest,
//       ...(normalizedMaterial !== undefined
//         ? { material: normalizedMaterial }
//         : {}),
//       updatedBy: req.user.id,
//       store:
//         storeId !== undefined
//           ? storeId
//             ? {
//                 connect: {
//                   id: storeId,
//                 },
//               }
//             : {
//                 disconnect: true,
//               }
//           : undefined,
//     };

//     const updatedVersorgungen = await prisma.versorgungen.update({
//       where: { id },
//       data: updatedVersorgungenData,
//       include: {
//         store: {
//           select: {
//             groessenMengen: true,
//           },
//         },
//       },
//     });

// // firmat output like create

// const formattedVersorgungen = {
//   ...updatedVersorgungen,
//   supplyStatus: updatedVersorgungen.supplyStatusId
//     ? {
//         ...updatedVersorgungen.supplyStatus,
//         image: updatedVersorgungen.supplyStatus.image
//           ? getImageUrl(`/uploads/${updatedVersorgungen.supplyStatus.image}`)
//           : null,
//       }
//     : null,
//   store: updatedVersorgungen.store
//     ? updatedVersorgungen.store.groessenMengen ?? null
//     : null,
// };

//     // res.status(200).json({
//     //   success: true,
//     //   message: "Versorgungen updated successfully",
//     //   data: {
//     //     ...updatedVersorgungenRest,
//     //     store: updatedVersorgungenStore?.groessenMengen ?? null,
//     //   },
//     // });
//   } catch (error) {
//     console.error("Patch Versorgungen error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Something went wrong",
//       error: error.message,
//     });
//   }
// };

export const patchVersorgungen = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const partnerId = req.user.id;

    const existing = await prisma.versorgungen.findFirst({
      where: { id, partnerId },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Versorgungen not found",
      });
    }

    const { material, storeId, supplyStatusId, ...rest } = req.body;

    // Validate diagnosis_status if provided
    if (rest.diagnosis_status !== undefined) {
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

      if (
        rest.diagnosis_status &&
        !validDiagnosisStatuses.includes(rest.diagnosis_status)
      ) {
        return res.status(400).json({
          success: false,
          message: `Invalid diagnosis_status. Valid values are: ${validDiagnosisStatuses.join(
            ", "
          )}`,
        });
      }
    }

    const updateData: Prisma.VersorgungenUpdateInput = {};

    // Update only fields provided
    Object.keys(rest).forEach((key) => {
      if (rest[key] !== undefined) updateData[key] = rest[key];
    });

    // Material update
    if (material !== undefined) {
      const normalizedMaterial = normalizeMaterialInput(material);
      if (normalizedMaterial.length === 0) {
        return res.status(400).json({
          success: false,
          message: "material must contain at least one value",
        });
      }
      updateData.material = normalizedMaterial;
    }

    // Store connect / disconnect
    if (storeId !== undefined) {
      // Validate storeId if connecting
      if (storeId) {
        const existingStore = await prisma.stores.findUnique({
          where: { id: storeId },
        });

        if (!existingStore) {
          return res.status(400).json({
            success: false,
            message: "store not found",
          });
        }

        // Check if store belongs to partner
        if (existingStore.userId !== partnerId) {
          return res.status(400).json({
            success: false,
            message: "store not found",
          });
        }
      }

      updateData.store = storeId
        ? { connect: { id: storeId } }
        : { disconnect: true };
    }

    // SupplyStatus update if provided
    if (supplyStatusId !== undefined) {
      if (supplyStatusId) {
        const existingSupplyStatus = await prisma.supplyStatus.findUnique({
          where: { id: supplyStatusId },
          select: { id: true },
        });

        if (!existingSupplyStatus) {
          return res.status(400).json({
            success: false,
            message: "supplyStatus not found",
          });
        }

        updateData.supplyStatus = { connect: { id: supplyStatusId } };
      } else {
        updateData.supplyStatus = { disconnect: true };
      }
    }

    updateData.updatedBy = req.user.id;

    // Update + include store & supplyStatus
    const updated = await prisma.versorgungen.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        rohlingHersteller: true,
        artikelHersteller: true,
        versorgung: true,
        material: true,
        diagnosis_status: true,
        supplyStatus: {
          select: {
            name: true,
            price: true,
            image: true,
          },
        },
        store: {
          select: {
            groessenMengen: true,
          },
        },
      },
    });

    // Format the response exactly like createVersorgungen
    const formattedResponse = {
      ...updated,
      supplyStatus: updated.supplyStatus
        ? {
            ...updated.supplyStatus,
            image: updated.supplyStatus.image
              ? getImageUrl(`/uploads/${updated.supplyStatus.image}`)
              : null,
          }
        : null,
      store: updated.store ? updated.store?.groessenMengen : null,
    };

    return res.status(200).json({
      success: true,
      message: "Versorgungen updated successfully",
      data: formattedResponse,
    });
  } catch (error) {
    console.error("Patch Versorgungen error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

export const deleteVersorgungen = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { partnerId } = req.user?.id;

    const existing = await prisma.versorgungen.findFirst({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Versorgungen not found",
      });
    }

    let needId = await prisma.versorgungen.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: "Versorgungen deleted successfully",
      data: {
        id: needId?.id,
      },
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


// export const getVersorgungenByDiagnosis = async (
//   req: Request,
//   res: Response
// ) => {
//   try {
//     const { diagnosis_status } = req.params;
//     const { page = 1, limit = 10, status } = req.query;
//     const partnerId = req.user.id;

//     const pageNumber = parseInt(page as string, 10);
//     const limitNumber = parseInt(limit as string, 10);

//     if (isNaN(pageNumber) || isNaN(limitNumber)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid type page or limit",
//       });
//     }

//     // Validate diagnosis_status
//     const validDiagnosisStatuses = [
//       "HAMMERZEHEN_KRALLENZEHEN",
//       "MORTON_NEUROM",
//       "FUSSARTHROSE",
//       "STRESSFRAKTUREN_IM_FUSS",
//       "DIABETISCHES_FUSSSYNDROM",
//       "HOHLFUSS",
//       "KNICKFUSS",
//       "KNICK_SENKFUSS",
//       "HALLUX_VALGUS",
//       "HALLUX_RIGIDUS",
//       "PLANTARFASZIITIS",
//       "FERSENSPORN",
//       "SPREIZFUSS",
//       "SENKFUSS",
//       "PLATTFUSS",
//     ];

//     if (!validDiagnosisStatuses.includes(diagnosis_status)) {
//       return res.status(400).json({
//         success: false,
//         message: `Invalid diagnosis_status. Valid values are: ${validDiagnosisStatuses.join(
//           ", "
//         )}`,
//       });
//     }

//     const filters: any = {
//       diagnosis_status: diagnosis_status,
//     };

//     if (status) {
//       filters.status = status;
//     }

//     const totalCount = await prisma.versorgungen.count({
//       where: filters,
//     });

//     //restectade partner id
//     const versorgungenList = await prisma.versorgungen.findMany({
//       where: { ...filters, createdBy: partnerId },
//       skip: (pageNumber - 1) * limitNumber,
//       take: limitNumber,
//       orderBy: {
//         createdAt: "desc",
//       },

//     });

//     const totalPages = Math.ceil(totalCount / limitNumber);

//     res.status(200).json({
//       success: true,
//       message: `Versorgungen for ${diagnosis_status} fetched successfully`,
//       data: versorgungenList,
//       pagination: {
//         totalItems: totalCount,
//         totalPages,
//         currentPage: pageNumber,
//         itemsPerPage: limitNumber,
//       },
//       diagnosis_status: diagnosis_status,
//     });
//   } catch (error) {
//     console.error("Get Versorgungen by Diagnosis error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Something went wrong",
//       error: error.message,
//     });
//   }
// };

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

    // Cast diagnosis_status to the Prisma enum type
    const prismaDiagnosisStatus = diagnosis_status as Prisma.VersorgungenWhereInput["diagnosis_status"];

    // Build the filter query
    const whereClause: Prisma.VersorgungenWhereInput = {
      diagnosis_status: prismaDiagnosisStatus,
      partnerId: partnerId, // Use partnerId instead of createdBy
    };

    // If status filter is provided, filter by supplyStatus name
    if (status) {
      whereClause.supplyStatus = {
        name: status as string
      };
    }

    // Get total count
    const totalCount = await prisma.versorgungen.count({
      where: whereClause,
    });

    // Get paginated results with related data
    const versorgungenList = await prisma.versorgungen.findMany({
      where: whereClause,
      skip: (pageNumber - 1) * limitNumber,
      take: limitNumber,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        supplyStatus: {
          select: {
            id: true,
            name: true,
            price: true,
            image: true,
          },
        },
        store: {
          select: {
            id: true,
            produktname: true,
            groessenMengen: true,
          },
        },
      },
    });

    // Format the response to include image URLs and consistent structure
    const formattedVersorgungenList = versorgungenList.map(versorgung => ({
      id: versorgung.id,
      name: versorgung.name,
      rohlingHersteller: versorgung.rohlingHersteller,
      artikelHersteller: versorgung.artikelHersteller,
      versorgung: versorgung.versorgung,
      material: versorgung.material,
      diagnosis_status: versorgung.diagnosis_status,
      createdAt: versorgung.createdAt,
      updatedAt: versorgung.updatedAt,
      supplyStatus: versorgung.supplyStatus ? {
        ...versorgung.supplyStatus,
        image: versorgung.supplyStatus.image
          ? getImageUrl(`/uploads/${versorgung.supplyStatus.image}`)
          : null,
      } : null,
      store: versorgung.store ? {
        id: versorgung.store.id,
        name: versorgung.store.produktname,
        groessenMengen: versorgung.store.groessenMengen,
      } : null,
    }));

    const totalPages = Math.ceil(totalCount / limitNumber);

    res.status(200).json({
      success: true,
      message: `Versorgungen for ${diagnosis_status} fetched successfully`,
      data: formattedVersorgungenList,
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

//-------------------------------- Supply Status --------------------------------

export const getSupplyStatus = async (req: Request, res: Response) => {
  console.log("getSupplyStatus");
  try {
    const partnerId = req.user.id;

    const { page = 1, limit = 10 } = req.query;
    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);

    if (isNaN(pageNumber) || isNaN(limitNumber)) {
      return res.status(400).json({
        success: false,
        message: "Invalid type page or limit",
      });
    }

    const totalCount = await prisma.supplyStatus.count({
      where: {
        partnerId: partnerId,
      },
    });

    const totalPages = Math.ceil(totalCount / limitNumber);

    const supplyStatus = await prisma.supplyStatus.findMany({
      where: {
        partnerId: partnerId,
      },
      skip: (pageNumber - 1) * limitNumber,
      take: limitNumber,
      select: {
        id: true,
        name: true,
        price: true,
        image: true,
      },
    });

    const formattedSupplyStatus = supplyStatus.map((item) => ({
      ...item,
      image: item.image ? getImageUrl(`/uploads/${item.image}`) : null,
    }));

    res.status(200).json({
      success: true,
      message: "Supply status fetched successfully",
      data: formattedSupplyStatus,
      pagination: {
        totalItems: totalCount,
        totalPages,
        currentPage: pageNumber,
        itemsPerPage: limitNumber,
        hasNextPage: pageNumber < totalPages,
        hasPrevPage: pageNumber > 1,
      },
    });
  } catch (error) {
    console.error("Get Supply Status error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

export const getSingleSupplyStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const supplyStatus = await prisma.supplyStatus.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        price: true,
        image: true,
        partner: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Supply status fetched successfully",
      data: {
        ...supplyStatus,
        image: supplyStatus.image
          ? getImageUrl(`/uploads/${supplyStatus.image}`)
          : null,
        partner: supplyStatus.partner
          ? {
              ...supplyStatus.partner,
              image: supplyStatus.partner.image
                ? getImageUrl(`/uploads/${supplyStatus.partner.image}`)
                : null,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Get Single Supply Status error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

export const createSupplyStatus = async (req: Request, res: Response) => {
  try {
    const { name, price } = req.body;
    const image = req.file?.filename;

    const priceFloat = parseFloat(price);
    if (isNaN(priceFloat)) {
      return res.status(400).json({
        success: false,
        message: "Price must be a number",
      });
    }

    const missingField = ["name", "price"].find((field) => !req.body[field]);
    if (missingField) {
      if (req.file) {
        const imagePath = path.join(
          process.cwd(),
          "uploads",
          req.file.filename
        );
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
      return res.status(400).json({
        success: false,
        message: `${missingField} is required`,
      });
    }
    if (!image) {
      return res.status(400).json({
        success: false,
        message: "Image is required",
      });
    }

    const partnerId = req.user?.id;

    const supplyStatus = await prisma.supplyStatus.create({
      data: {
        name,
        price: priceFloat,
        image,
        partner: {
          connect: { id: partnerId },
        },
      },
    });

    const imageUrl = image ? getImageUrl(`/uploads/${image}`) : null;

    res.status(201).json({
      success: true,
      message: "Supply status created successfully",
      data: {
        ...supplyStatus,
        image: imageUrl,
      },
    });
  } catch (error) {
    console.error("Create Supply Status error:", error);
    if (req.file) {
      const imagePath = path.join(process.cwd(), "uploads", req.file.filename);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

export const updateSupplyStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const partnerId = req.user.id;
    const { name, price } = req.body;

    const image = req.file?.filename;

    const existing = await prisma.supplyStatus.findUnique({ where: { id } });
    if (!existing)
      return res
        .status(404)
        .json({ success: false, message: "Supply status not found" });
    if (existing.partnerId !== partnerId)
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });

    // Prepare update data
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;

    if (price !== undefined) {
      const priceFloat = parseFloat(price);
      if (isNaN(priceFloat))
        return res
          .status(400)
          .json({ success: false, message: "Price must be a number" });
      updateData.price = priceFloat;
    }

    if (image) {
      updateData.image = image;
      // Remove old image
      if (existing.image) {
        console.log("existing.image", existing.image);
        const oldPath = path.join(process.cwd(), "uploads", existing.image);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
          console.log(`Deleted old image: ${oldPath}`); // Debug log
        } else {
          console.log(`Old image not found at: ${oldPath}`); // Debug log
        }
      }
    }

    // Update and respond
    const updated = await prisma.supplyStatus.update({
      where: { id },
      data: updateData,
    });

    res.status(200).json({
      success: true,
      message: "Supply status updated",
      data: {
        ...updated,
        image: updated.image ? getImageUrl(`/uploads/${updated.image}`) : null,
      },
    });
  } catch (error) {
    console.error("Update error:", error);
    // Clean up uploaded file on error
    if (req.file) {
      const newPath = path.join(process.cwd(), "uploads", req.file.filename);
      if (fs.existsSync(newPath)) {
        fs.unlinkSync(newPath);
        console.log(`Cleaned up new image on error: ${newPath}`); // Debug log
      }
    }
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

export const deleteSupplyStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const supplyStatus = await prisma.supplyStatus.delete({
      where: { id },
    });

    if (supplyStatus.image) {
      const imagePath = path.join(process.cwd(), "uploads", supplyStatus.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    res.status(200).json({
      success: true,
      message: "Supply status deleted successfully",
      data: supplyStatus.id,
    });
  } catch (error) {
    console.error("Delete Supply Status error:", error);

    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Supply status not found",
      });
    }
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};
