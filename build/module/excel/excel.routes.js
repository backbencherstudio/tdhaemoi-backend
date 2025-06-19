"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const excel_controllers_1 = require("./excel.controllers");
const router = express_1.default.Router();
router.get("/", excel_controllers_1.getExcelData);
exports.default = router;
//# sourceMappingURL=excel.routes.js.map