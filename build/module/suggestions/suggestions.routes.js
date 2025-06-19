"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const suggestions_controllers_1 = require("./suggestions.controllers");
const verifyUsers_1 = require("../../middleware/verifyUsers");
const router = express_1.default.Router();
router.post("/feetf1rst", (0, verifyUsers_1.verifyUser)("PARTNER", "ADMIN"), suggestions_controllers_1.createSuggestions);
router.get("/feetf1rst", (0, verifyUsers_1.verifyUser)("PARTNER"), suggestions_controllers_1.getAllSuggestions);
router.delete("/feetf1rst/:id", (0, verifyUsers_1.verifyUser)("PARTNER"), suggestions_controllers_1.deleteSuggestion);
router.delete("/feetf1rst", (0, verifyUsers_1.verifyUser)("PARTNER"), suggestions_controllers_1.deleteAllSuggestions);
router.post("/improvement", (0, verifyUsers_1.verifyUser)("PARTNER", "ADMIN"), suggestions_controllers_1.createImprovement);
router.get("/improvement", (0, verifyUsers_1.verifyUser)("PARTNER"), suggestions_controllers_1.getAllImprovements);
router.delete("/improvement/:id", (0, verifyUsers_1.verifyUser)("PARTNER"), suggestions_controllers_1.deleteImprovement);
router.delete("/improvement", (0, verifyUsers_1.verifyUser)("PARTNER"), suggestions_controllers_1.deleteAllImprovements);
exports.default = router;
//# sourceMappingURL=suggestions.routes.js.map