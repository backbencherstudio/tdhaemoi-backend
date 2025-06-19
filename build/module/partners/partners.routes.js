"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const partners_controllers_1 = require("./partners.controllers");
const verifyUsers_1 = require("../../middleware/verifyUsers");
const multer_config_1 = __importDefault(require("../../config/multer.config"));
const router = express_1.default.Router();
router.post("/create", (0, verifyUsers_1.verifyUser)("ADMIN"), partners_controllers_1.createPartnership);
router.patch("/update-partner-profile", (0, verifyUsers_1.verifyUser)("ADMIN", "PARTNER"), multer_config_1.default.single("image"), partners_controllers_1.updatePartnerProfile);
router.get("/", (0, verifyUsers_1.verifyUser)("ADMIN"), partners_controllers_1.getAllPartners);
router.get("/:id", (0, verifyUsers_1.verifyUser)("ADMIN"), partners_controllers_1.getPartnerById);
router.put("/update/:id", (0, verifyUsers_1.verifyUser)("ADMIN"), multer_config_1.default.single("image"), partners_controllers_1.updatePartnerByAdmin);
router.delete("/delete/:id", (0, verifyUsers_1.verifyUser)("ADMIN"), partners_controllers_1.deletePartner);
// Forgot Password Routes
router.post("/forgot-password/send-otp", partners_controllers_1.forgotPasswordSendOtp);
router.post("/forgot-password/verify-otp", partners_controllers_1.forgotPasswordVerifyOtp);
router.post("/forgot-password/reset", partners_controllers_1.resetPassword);
// Add this route before the export
router.post("/change-password", (0, verifyUsers_1.verifyUser)("PARTNER", "ADMIN"), partners_controllers_1.changePassword);
exports.default = router;
//# sourceMappingURL=partners.routes.js.map