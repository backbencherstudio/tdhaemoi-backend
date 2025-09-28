import e, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const manageWorkshopNote = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      employeeId,
      completionDays,
      sameAsBusiness,
      showCompanyLogo,
      autoShowAfterPrint,
      autoApplySupply,
      
    } = req.body;

    let employeeName: string | null = null;
    let validEmployeeId: string | null = null;

    if (employeeId) {
      console.log(employeeId);
      const employee = await prisma.employees.findUnique({
        where: { id: employeeId },
        select: { employeeName: true },
      });
      console.log(employee);
      if (employee) {
        validEmployeeId = employeeId;
        employeeName = employee.employeeName;
      }
    }

    const partner = await prisma.user.findFirst({
      where: { id: userId },
      select: { hauptstandort: true },
    });

    const workshopNote = await prisma.workshopNote.upsert({
      where: { userId },
      create: {
        userId,
        employeeId: validEmployeeId,
        employeeName,
        completionDays: completionDays || "5 Werktage",
        pickupLocation: sameAsBusiness ? partner?.hauptstandort : null,
        sameAsBusiness: sameAsBusiness ?? true,
        showCompanyLogo: showCompanyLogo ?? true,
        autoShowAfterPrint: autoShowAfterPrint ?? true,
        autoApplySupply: autoApplySupply ?? true,
      },
      update: {
        employeeId: validEmployeeId,
        employeeName,
        completionDays: completionDays || "5 Werktage",
        pickupLocation: sameAsBusiness ? partner?.hauptstandort : null,
        sameAsBusiness: sameAsBusiness ?? true,
        showCompanyLogo: showCompanyLogo ?? true,
        autoShowAfterPrint: autoShowAfterPrint ?? true,
        autoApplySupply: autoApplySupply ?? true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "WorkshopNote set successfully",
      data: workshopNote,
    });
  } catch (error: any) {
    console.error("manageWorkshopNote error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error?.message,
    });
  }
};

export const getWorkshopNote = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;

    const workshopNote = await prisma.workshopNote.findUnique({
      where: { userId },
    });

    if (!workshopNote) {
      return res.status(404).json({
        success: false,
        message: "Workshop note not found for this user",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Workshop note fetched successfully",
      data: workshopNote,
    });
  } catch (error: any) {
    console.error("getWorkshopNote error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error?.message,
    });
  }
};
