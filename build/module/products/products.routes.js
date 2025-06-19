"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const products_controllers_1 = require("./products.controllers");
const multer_config_1 = __importDefault(require("../../config/multer.config"));
const verifyUsers_1 = require("../../middleware/verifyUsers");
const router = express_1.default.Router();
router.post("/", (0, verifyUsers_1.verifyUser)("ADMIN"), multer_config_1.default.array("images", 10000), products_controllers_1.createProduct);
router.put("/:id", (0, verifyUsers_1.verifyUser)("ADMIN"), multer_config_1.default.array("images", 10000), products_controllers_1.updateProduct);
router.get("/", products_controllers_1.getAllProducts);
router.get("/categories", products_controllers_1.getCategorizedProducts);
router.get("/technical-icons", products_controllers_1.characteristicsIcons);
router.delete("/:id/:imageName", (0, verifyUsers_1.verifyUser)("ADMIN"), products_controllers_1.deleteImage);
router.get("/query", products_controllers_1.queryProducts);
router.delete("/:id", (0, verifyUsers_1.verifyUser)("ADMIN"), products_controllers_1.deleteProduct);
router.get("/:id", products_controllers_1.getSingleProduct);
exports.default = router;
//# sourceMappingURL=products.routes.js.map