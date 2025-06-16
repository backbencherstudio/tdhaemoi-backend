import express from "express";
import { createMessage, getSentMessages, getReceivedMessages, favoriteMessage } from "./messages.controllers";
import { verifyUser } from "../../middleware/verifyUsers";

const router = express.Router();

router.post("/", verifyUser("PARTNER", "ADMIN"), createMessage);
router.get("/sendbox", verifyUser("PARTNER", "ADMIN"), getSentMessages);
router.get("/inbox", verifyUser("PARTNER", "ADMIN"), getReceivedMessages);
//select as favourite
router.put("/:id/favorite", verifyUser("PARTNER", "ADMIN"), favoriteMessage);

export default router;