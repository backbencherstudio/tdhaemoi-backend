"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const users_controllers_1 = require("./users.controllers");
const verifyUsers_1 = require("../../middleware/verifyUsers");
const multer_config_1 = __importDefault(require("../../config/multer.config"));
const router = express_1.default.Router();
router.post("/register", multer_config_1.default.single("image"), users_controllers_1.createUser);
router.post("/login", users_controllers_1.loginUser);
router.put("/", (0, verifyUsers_1.verifyUser)('ANY'), multer_config_1.default.single("image"), users_controllers_1.updateUser);
router.patch("/change-password", (0, verifyUsers_1.verifyUser)('ANY'), users_controllers_1.changePassword);
router.post("/create-partnership", (0, verifyUsers_1.verifyUser)('ADMIN'), users_controllers_1.createPartnership);
router.patch("/update-partner-profile", (0, verifyUsers_1.verifyUser)('ADMIN', 'PARTNER'), multer_config_1.default.single("image"), users_controllers_1.updatePartnerProfile);
router.get("/partners", (0, verifyUsers_1.verifyUser)('ADMIN'), users_controllers_1.getAllPartners);
router.get("/check-auth", users_controllers_1.checkAuthStatus);
exports.default = router;
//# sourceMappingURL=users.routes.js.map