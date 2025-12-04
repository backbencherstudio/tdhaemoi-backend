import express from "express";

import { verifyUser } from "../../../middleware/verifyUsers";
import {
  createVersorgungen,
  deleteVersorgungen,
  getAllVersorgungen,
  getVersorgungenByDiagnosis,
  getSingleVersorgungen,
  patchVersorgungen,
  getSupplyStatus,
  createSupplyStatus,
  updateSupplyStatus,
  deleteSupplyStatus
} from "./versorgungen.controllers";
import upload from "../../../config/multer.config";

const router = express.Router();

router.get("/", verifyUser("PARTNER"), getAllVersorgungen);
router.get("/diagnosis/:diagnosis_status", verifyUser("PARTNER"), getVersorgungenByDiagnosis);
// get single versorgungen
router.get("/single/:id", verifyUser("PARTNER"), getSingleVersorgungen);
router.post("/", verifyUser("PARTNER"), createVersorgungen);
router.patch("/:id", verifyUser("PARTNER"), patchVersorgungen);
router.delete("/:id", verifyUser("PARTNER"), deleteVersorgungen);


//current supply status
router.get("/supply-status", verifyUser("PARTNER"), getSupplyStatus);
router.post("/supply-status", verifyUser("PARTNER"), upload.single("image"), createSupplyStatus);
router.patch("/supply-status/:id", verifyUser("PARTNER"), upload.single("image"), updateSupplyStatus);
router.delete("/supply-status/:id", verifyUser("PARTNER"), deleteSupplyStatus);

export default router;
