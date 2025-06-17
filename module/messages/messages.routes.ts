import express from "express";
import { createMessage, getSentMessages, getReceivedMessages, setToFavorite, getFavoriteMessages } from "./messages.controllers";
import { verifyUser } from "../../middleware/verifyUsers";

const router = express.Router();

router.post("/", verifyUser("PARTNER", "ADMIN"), createMessage);
router.get("/sendbox", verifyUser("PARTNER", "ADMIN"), getSentMessages);
router.get("/inbox", verifyUser("PARTNER", "ADMIN"), getReceivedMessages);
//select as favourite
router.put("/:id/favorite", verifyUser("PARTNER", "ADMIN"), setToFavorite);

router.get('/favorites', verifyUser("PARTNER", "ADMIN"), getFavoriteMessages);

export default router;