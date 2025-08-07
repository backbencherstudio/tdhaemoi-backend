import express from "express";

import { verifyUser } from "../../../middleware/verifyUsers";
import {
  createVersorgungen,
  deleteVersorgungen,
  getAllVersorgungen,
  getVersorgungenByDiagnosis,
  patchVersorgungen,
} from "./versorgungen.controllers";

const router = express.Router();

router.get("/", verifyUser("PARTNER"), getAllVersorgungen);
router.get("/diagnosis/:diagnosis_status", verifyUser("PARTNER"), getVersorgungenByDiagnosis);
router.post("/", verifyUser("PARTNER"), createVersorgungen);
router.patch("/:id", verifyUser("PARTNER"), patchVersorgungen);
router.delete("/:id", verifyUser("PARTNER"), deleteVersorgungen);

export default router;
