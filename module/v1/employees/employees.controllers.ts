import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createEmployee = async (req: Request, res: Response) => {
  try {
    const { accountName, employeeName, email, password, financialAccess } =
      req.body;

    const missingField = [
      "accountName",
      "employeeName",
      "email",
      "password",
    ].find((field) => !req.body[field]);
    if (missingField) {
      return res
        .status(400)
        .json({ success: false, message: `${missingField} is required!` });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Email already registered!",
        });
    }

    const existingEmployee = await prisma.employees.findUnique({
      where: { email },
    });

    if (existingEmployee) {
      return res
        .status(400)
        .json({ success: false, message: "Employee already exists!" });
    }

    const employeeData = {
      accountName,
      employeeName,
      email,
      password,
      financialAccess,
      partnerId: req.user.id,
    };

    const newEmployee = await prisma.employees.create({
      data: employeeData,
    });

    res.status(201).json({
      success: true,
      message: "Employee created successfully",
      data: newEmployee,
    });
  } catch (error) {
    console.error("Create Employee error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

export const getAllEmployees = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);

    if (isNaN(pageNumber) || isNaN(limitNumber)) {
      return res.status(400).json({
        success: false,
        message: "Invalid type page or limit",
      });
    }

    const totalCount = await prisma.employees.count();
    const employeesList = await prisma.employees.findMany({
      skip: (pageNumber - 1) * limitNumber,
      take: limitNumber,
      orderBy: {
        createdAt: "desc",
      },
    });

    const totalPages = Math.ceil(totalCount / limitNumber);

    res.status(200).json({
      success: true,
      message: "Employees fetched successfully",
      data: employeesList,
      pagination: {
        totalItems: totalCount,
        totalPages,
        currentPage: pageNumber,
        itemsPerPage: limitNumber,
      },
    });
  } catch (error) {
    console.error("Get All Employees error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

export const updateEmployee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existingEmployee = await prisma.employees.findUnique({
      where: { id },
    });

    if (!existingEmployee) {
      return res
        .status(404)
        .json({ success: false, message: "Employee not found" });
    }

    const updatedData = {
      ...req.body,
    };

    const updatedEmployee = await prisma.employees.update({
      where: { id },
      data: updatedData,
    });

    res.status(200).json({
      success: true,
      message: "Employee updated successfully",
      data: updatedEmployee,
    });
  } catch (error) {
    console.error("Update Employee error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

export const deleteEmployee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existingEmployee = await prisma.employees.findUnique({
      where: { id },
    });

    if (!existingEmployee) {
      return res
        .status(404)
        .json({ success: false, message: "Employee not found" });
    }

    await prisma.employees.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: "Employee deleted successfully",
    });
  } catch (error) {
    console.error("Delete Employee error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};
