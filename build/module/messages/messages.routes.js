"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const messages_controllers_1 = require("./messages.controllers");
const verifyUsers_1 = require("../../middleware/verifyUsers");
const router = express_1.default.Router();
router.post("/", (0, verifyUsers_1.verifyUser)("PARTNER", "ADMIN"), messages_controllers_1.createMessage);
router.get("/sendbox", (0, verifyUsers_1.verifyUser)("PARTNER", "ADMIN"), messages_controllers_1.getSentMessages);
router.get("/inbox", (0, verifyUsers_1.verifyUser)("PARTNER", "ADMIN"), messages_controllers_1.getReceivedMessages);
//select as favourite
router.put("/:id/favorite", (0, verifyUsers_1.verifyUser)("PARTNER", "ADMIN"), messages_controllers_1.setToFavorite);
router.get("/favorites", (0, verifyUsers_1.verifyUser)("PARTNER", "ADMIN"), messages_controllers_1.getFavoriteMessages);
router.get("/:id", (0, verifyUsers_1.verifyUser)("PARTNER", "ADMIN"), messages_controllers_1.getMessageById);
// Add this to your existing routes
router.delete("/permanent", (0, verifyUsers_1.verifyUser)("PARTNER", "ADMIN"), messages_controllers_1.permanentDeleteMessages);
router.delete("/delete/:id", (0, verifyUsers_1.verifyUser)("PARTNER", "ADMIN"), messages_controllers_1.deleteSingleMessage);
exports.default = router;
//# sourceMappingURL=messages.routes.js.map