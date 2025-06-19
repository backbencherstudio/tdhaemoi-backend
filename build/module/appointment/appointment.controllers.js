"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyAppointments = exports.deleteAppointment = exports.updateAppointment = exports.getAppointmentById = exports.getAllAppointments = exports.createAppointment = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Create appointment
const createAppointment = async (req, res) => {
    try {
        const { customer_name, time, date, reason, assignedTo, details, isClient } = req.body;
        const { id } = req.user;
        const missingField = [
            "customer_name",
            "time",
            "date",
            "reason",
            "assignedTo",
            "details",
        ].find((field) => !req.body[field]);
        if (missingField) {
            res.status(400).json({
                success: false,
                message: `${missingField} is required!`,
            });
            return;
        }
        // 🔥 Build data object conditionally
        const appointmentData = {
            customer_name,
            time,
            date: new Date(date),
            reason,
            assignedTo,
            details,
            userId: id,
        };
        // ✅ Only include isClient if it was sent (not undefined)
        if (typeof isClient !== "undefined") {
            appointmentData.isClient = isClient;
        }
        const appointment = await prisma.appointment.create({
            data: appointmentData,
        });
        res.status(201).json({
            success: true,
            message: "Appointment created successfully",
            appointment,
        });
    }
    catch (error) {
        console.error("Create appointment error:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error.message,
        });
    }
};
exports.createAppointment = createAppointment;
// Get all appointments
const getAllAppointments = async (req, res) => {
    try {
        const appointments = await prisma.appointment.findMany({
            orderBy: {
                createdAt: "desc",
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        });
        res.status(200).json({
            success: true,
            appointments,
        });
    }
    catch (error) {
        console.error("Get all appointments error:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error.message,
        });
    }
};
exports.getAllAppointments = getAllAppointments;
// Get appointment by ID
const getAppointmentById = async (req, res) => {
    try {
        const { id } = req.params;
        const appointment = await prisma.appointment.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        });
        if (!appointment) {
            res.status(404).json({
                success: false,
                message: "Appointment not found",
            });
            return;
        }
        res.status(200).json({
            success: true,
            appointment,
        });
    }
    catch (error) {
        console.error("Get appointment error:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error.message,
        });
    }
};
exports.getAppointmentById = getAppointmentById;
// Update appointment
const updateAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const { customer_name, time, date, reason, assignedTo, details, isClient } = req.body;
        const existingAppointment = await prisma.appointment.findUnique({
            where: { id },
        });
        if (!existingAppointment) {
            res.status(404).json({
                success: false,
                message: "Appointment not found",
            });
            return;
        }
        const updatedAppointment = await prisma.appointment.update({
            where: { id },
            data: {
                customer_name: customer_name || existingAppointment.customer_name,
                time: time || existingAppointment.time,
                date: date ? new Date(date) : existingAppointment.date,
                reason: reason || existingAppointment.reason,
                assignedTo: assignedTo || existingAppointment.assignedTo,
                details: details || existingAppointment.details,
                isClient: isClient !== undefined ? isClient : existingAppointment.isClient,
            },
        });
        res.status(200).json({
            success: true,
            message: "Appointment updated successfully",
            appointment: updatedAppointment,
        });
    }
    catch (error) {
        console.error("Update appointment error:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error.message,
        });
    }
};
exports.updateAppointment = updateAppointment;
// Delete appointment
const deleteAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const appointment = await prisma.appointment.findUnique({
            where: { id },
        });
        if (!appointment) {
            res.status(404).json({
                success: false,
                message: "Appointment not found",
            });
            return;
        }
        await prisma.appointment.delete({
            where: { id },
        });
        res.status(200).json({
            success: true,
            message: "Appointment deleted successfully",
        });
    }
    catch (error) {
        console.error("Delete appointment error:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error.message,
        });
    }
};
exports.deleteAppointment = deleteAppointment;
// Get my appointments
const getMyAppointments = async (req, res) => {
    try {
        const { id } = req.user;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const skip = (page - 1) * limit;
        // Define search conditions for better readability
        const searchConditions = search ? [
            { customer_name: { contains: search, mode: 'insensitive' } },
            { details: { contains: search, mode: 'insensitive' } },
            { reason: { contains: search, mode: 'insensitive' } },
            { assignedTo: { contains: search, mode: 'insensitive' } },
            { time: { contains: search, mode: 'insensitive' } }
        ] : undefined;
        // Define base where condition
        const whereCondition = {
            userId: id,
            OR: searchConditions
        };
        const [appointments, totalCount] = await Promise.all([
            prisma.appointment.findMany({
                where: whereCondition,
                skip,
                take: limit,
                orderBy: {
                    createdAt: 'desc'
                },
                // include: {
                //   user: {
                //     select: {
                //       name: true,
                //       email: true
                //     }
                //   }
                // }
            }),
            prisma.appointment.count({
                where: whereCondition
            })
        ]);
        res.status(200).json({
            success: true,
            data: appointments,
            pagination: {
                total: totalCount,
                page,
                limit,
                totalPages: Math.ceil(totalCount / limit)
            }
        });
    }
    catch (error) {
        console.error('Get my appointments error:', error);
        res.status(500).json({
            success: false,
            message: 'Something went wrong',
            error: error.message
        });
    }
};
exports.getMyAppointments = getMyAppointments;
//# sourceMappingURL=appointment.controllers.js.map