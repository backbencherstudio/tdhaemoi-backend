import express from "express";
import { verifyUser } from "../../../middleware/verifyUsers";
import upload from "../../../config/multer.config";
import { createTustomShafts } from "./custom_shafts.controllers";

const router = express.Router();

router.post(
  "/create",
  verifyUser("PARTNER", "ADMIN"),
  upload.fields([
    { name: "image3d_1", maxCount: 1 },
    { name: "image3d_2", maxCount: 1 },
  ]),
  createTustomShafts
);

export default router;