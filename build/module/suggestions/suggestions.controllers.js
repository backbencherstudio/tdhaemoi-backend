"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAllImprovements = exports.deleteImprovement = exports.getAllImprovements = exports.createImprovement = exports.deleteAllSuggestions = exports.deleteSuggestion = exports.getAllSuggestions = exports.createSuggestions = void 0;
const client_1 = require("@prisma/client");
const validator_1 = __importDefault(require("validator"));
const emailService_utils_1 = require("../../utils/emailService.utils");
const prisma = new client_1.PrismaClient();
// model SuggestionFeetf1rst {
//   id String @id @default(uuid())
//   reason     String
//   name       String
//   phone      String
//   suggestion String
//   userId     String
//   user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
//   createdAt  DateTime @default(now())
// }
const createSuggestions = async (req, res) => {
    try {
        const { reason, name, phone, suggestion } = req.body;
        const { id } = req.user;
        const missingField = ["reason", "name", "phone", "suggestion"].find((field) => !req.body[field]);
        if (missingField) {
            res.status(400).json({
                success: false,
                message: `${missingField} is required!`,
            });
            return;
        }
        if (!validator_1.default.isMobilePhone(phone)) {
            res.status(400).json({
                success: false,
                message: "Invalid phone number format!",
            });
            return;
        }
        const newSuggestion = await prisma.suggestionFeetf1rst.create({
            data: {
                reason,
                name,
                phone,
                suggestion,
                userId: id,
            },
        });
        const user = await prisma.user.findUnique({
            where: { id },
            select: { email: true },
        });
        (0, emailService_utils_1.sendNewSuggestionEmail)(name, "email", phone, "firma", suggestion);
        res.status(201).json({
            success: true,
            message: "Suggestion created successfully",
            suggestion: newSuggestion,
        });
    }
    catch (error) {
        console.error("Create suggestion error:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.createSuggestions = createSuggestions;
const getAllSuggestions = async (req, res) => {
    try {
        const suggestions = await prisma.suggestionFeetf1rst.findMany({
            orderBy: {
                createdAt: "desc", // Newest first
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
            suggestions,
        });
    }
    catch (error) {
        console.error("Get all suggestions error:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error.message,
        });
    }
};
exports.getAllSuggestions = getAllSuggestions;
const deleteSuggestion = async (req, res) => {
    try {
        const { id } = req.params;
        const suggestion = await prisma.suggestionFeetf1rst.findUnique({
            where: { id },
        });
        if (!suggestion) {
            res.status(404).json({
                success: false,
                message: "Suggestion not found",
            });
            return;
        }
        await prisma.suggestionFeetf1rst.delete({
            where: { id },
        });
        res.status(200).json({
            success: true,
            message: "Suggestion deleted successfully",
        });
    }
    catch (error) {
        console.error("Delete suggestion error:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error.message,
        });
    }
};
exports.deleteSuggestion = deleteSuggestion;
const deleteAllSuggestions = async (req, res) => {
    try {
        await prisma.suggestionFeetf1rst.deleteMany();
        res.status(200).json({
            success: true,
            message: "All suggestions deleted successfully",
        });
    }
    catch (error) {
        console.error("Delete all suggestions error:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error.message,
        });
    }
};
exports.deleteAllSuggestions = deleteAllSuggestions;
// model ImprovementSuggestion {
//   id         String   @id @default(uuid())
//   name       String
//   email      String
//   firma      String
//   phone      String
//   suggestion String
//   user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
//   userId     String
//   createdAt  DateTime @default(now())
// }
const createImprovement = async (req, res) => {
    try {
        const { name, email, firma, phone, suggestion } = req.body;
        const { id: userId } = req.user;
        const missingField = ["name", "email", "firma", "phone", "suggestion"].find((field) => !req.body[field]);
        if (missingField) {
            res.status(400).json({
                success: false,
                message: `${missingField} is required!`,
            });
            return;
        }
        // Check if user exists
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            res.status(400).json({
                success: false,
                message: "User not found",
            });
            return;
        }
        // Map request fields to model fields
        const newImprovement = await prisma.improvementSuggestion.create({
            data: {
                name,
                email,
                firma,
                phone,
                suggestion,
                user: {
                    connect: {
                        id: userId,
                    },
                },
            },
        });
        (0, emailService_utils_1.sendImprovementEmail)(name, email, firma, suggestion);
        res.status(201).json({
            success: true,
            message: "Improvement suggestion created successfully",
            improvement: newImprovement,
        });
    }
    catch (error) {
        console.error("Create improvement suggestion error:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error.message,
        });
    }
};
exports.createImprovement = createImprovement;
const getAllImprovements = async (req, res) => {
    try {
        const improvements = await prisma.improvementSuggestion.findMany({
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
            improvements,
        });
    }
    catch (error) {
        console.error("Get all improvement suggestions error:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error.message,
        });
    }
};
exports.getAllImprovements = getAllImprovements;
const deleteImprovement = async (req, res) => {
    try {
        const { id } = req.params;
        const improvement = await prisma.improvementSuggestion.findUnique({
            where: { id },
        });
        if (!improvement) {
            res.status(404).json({
                success: false,
                message: "Improvement suggestion not found",
            });
            return;
        }
        await prisma.improvementSuggestion.delete({
            where: { id },
        });
        res.status(200).json({
            success: true,
            message: "Improvement suggestion deleted successfully",
        });
    }
    catch (error) {
        console.error("Delete improvement suggestion error:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error.message,
        });
    }
};
exports.deleteImprovement = deleteImprovement;
const deleteAllImprovements = async (req, res) => {
    try {
        await prisma.improvementSuggestion.deleteMany();
        res.status(200).json({
            success: true,
            message: "All improvement suggestions deleted successfully",
        });
    }
    catch (error) {
        console.error("Delete all improvement suggestions error:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error.message,
        });
    }
};
exports.deleteAllImprovements = deleteAllImprovements;
//# sourceMappingURL=suggestions.controllers.js.map