import express from "express";
import { verifyUser } from "../../../middleware/verifyUsers";
import upload from "../../../config/multer.config";
import {
  createMaßschaftKollektion,
  createTustomShafts,
  getAllMaßschaftKollektion,
  getMaßschaftKollektionById,
  updateMaßschaftKollektion,
} from "./custom_shafts.controllers";

const router = express.Router();

router.post(
  "/create/mabschaft_kollektion",
  verifyUser("PARTNER", "ADMIN"),
  upload.fields([{ name: "image", maxCount: 1 }]),
  createMaßschaftKollektion
);

router.post(
  "/create",
  verifyUser("PARTNER", "ADMIN"),
  upload.fields([
    { name: "image3d_1", maxCount: 1 },
    { name: "image3d_2", maxCount: 1 },
  ]),
  createTustomShafts
);

router.get(
  "/mabschaft_kollektion",
  verifyUser("PARTNER", "ADMIN"),
  getAllMaßschaftKollektion
);

router.patch(
  "/mabschaft_kollektion/:id",
  verifyUser("PARTNER", "ADMIN"),
  upload.fields([{ name: "image", maxCount: 1 }]),
  updateMaßschaftKollektion
);

router.get(
  "/mabschaft_kollektion/:id",
  verifyUser("PARTNER", "ADMIN"),
  getMaßschaftKollektionById
);

export default router;
