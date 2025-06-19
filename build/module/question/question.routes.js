"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const question_controllers_1 = require("./question.controllers");
const router = express_1.default.Router();
router.get("/:categoryTitle?/:subCategoryTitle?", question_controllers_1.getQuestionsFlow);
exports.default = router;
//# sourceMappingURL=question.routes.js.map