"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const verifyUser = (...allowedRoles) => {
    return (req, res, next) => {
        const authHeader = req.headers["authorization"];
        if (!authHeader) {
            res.status(401).json({ message: "No token provided" });
            return;
        }
        try {
            const token = authHeader;
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            if (allowedRoles.length &&
                !allowedRoles.includes("ANY") &&
                !allowedRoles.includes(req.user?.role)) {
                res
                    .status(403)
                    .json({ message: "Access denied. Insufficient permission." });
                return;
            }
            next();
        }
        catch (error) {
            res.status(401).json({ message: "Invalid or expired token" });
            return;
        }
    };
};
exports.verifyUser = verifyUser;
//# sourceMappingURL=verifyUsers.js.map