"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const appointment_controllers_1 = require("./appointment.controllers");
const verifyUsers_1 = require("../../middleware/verifyUsers");
const router = express_1.default.Router();
router.post("/", (0, verifyUsers_1.verifyUser)("PARTNER", "ADMIN"), appointment_controllers_1.createAppointment);
router.get("/", (0, verifyUsers_1.verifyUser)("ADMIN"), appointment_controllers_1.getAllAppointments);
router.get("/my", (0, verifyUsers_1.verifyUser)("PARTNER", "ADMIN"), appointment_controllers_1.getMyAppointments);
router.get("/:id", (0, verifyUsers_1.verifyUser)("PARTNER", "ADMIN"), appointment_controllers_1.getAppointmentById);
router.put("/:id", (0, verifyUsers_1.verifyUser)("PARTNER", "ADMIN"), appointment_controllers_1.updateAppointment);
router.delete("/:id", (0, verifyUsers_1.verifyUser)("PARTNER", "ADMIN"), appointment_controllers_1.deleteAppointment);
exports.default = router;
//# sourceMappingURL=appointment.routes.js.map