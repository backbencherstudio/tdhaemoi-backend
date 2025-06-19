import express from "express";
import {
  createMessage,
  getSentMessages,
  getReceivedMessages,
  setToFavorite,
  getFavoriteMessages,
  getMessageById,
  permanentDeleteMessages,
  deleteSingleMessage
} from "./messages.controllers";
import { verifyUser } from "../../middleware/verifyUsers";

const router = express.Router();

router.post("/", verifyUser("PARTNER", "ADMIN"), createMessage);
router.get("/sendbox", verifyUser("PARTNER", "ADMIN"), getSentMessages);
router.get("/inbox", verifyUser("PARTNER", "ADMIN"), getReceivedMessages);
//select as favourite
router.put("/:id/favorite", verifyUser("PARTNER", "ADMIN"), setToFavorite);

router.get("/favorites", verifyUser("PARTNER", "ADMIN"), getFavoriteMessages);
router.get("/:id", verifyUser("PARTNER", "ADMIN"), getMessageById);
// Add this to your existing routes
router.delete(
  "/permanent",
  verifyUser("PARTNER", "ADMIN"),
  permanentDeleteMessages
);

router.delete(
  "/delete/:id",
  verifyUser("PARTNER", "ADMIN"),
  deleteSingleMessage
);


export default router;
