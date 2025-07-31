import express from "express";

import { verifyUser } from "../../../middleware/verifyUsers";
import {
  createVersorgungen,
  deleteVersorgungen,
  getAllVersorgungen,
  patchVersorgungen,
} from "./versorgungen.controllers";

const router = express.Router();

router.get("/", verifyUser("PARTNER"), getAllVersorgungen);
router.post("/", verifyUser("PARTNER"), createVersorgungen);
router.patch("/:id", verifyUser("PARTNER"), patchVersorgungen);
router.delete("/:id", verifyUser("PARTNER"), deleteVersorgungen);

export default router;
