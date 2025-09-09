import express from "express";
import { verifyUser } from "../../../middleware/verifyUsers";
import {
  setNewPrice,
  getAllPrices,
  getPriceById,
  updatePrice,
  deletePrice,
} from "./customerPrice.controllers";

const router = express.Router();

router.post("/", verifyUser("PARTNER"), setNewPrice);
router.get("/", verifyUser("PARTNER"), getAllPrices);
router.get("/:id", verifyUser("PARTNER"), getPriceById);
router.patch("/:id", verifyUser("PARTNER"), updatePrice);
router.delete("/:id", verifyUser("PARTNER"), deletePrice);

export default router;
