import express from "express";
import { verifyUser } from "../../../middleware/verifyUsers";
import {
  createCustomerFile,
  getCustomerFiles,
} from "./customer_files.controllers";
import upload from "../../../config/multer.config";

const router = express.Router();

router.post(
  "/create/:customerId",
  verifyUser("PARTNER", "ADMIN"),
  upload.fields([{ name: "image", maxCount: 1 }]),
  createCustomerFile
);

router.get("/get", verifyUser("PARTNER", "ADMIN"), getCustomerFiles);

export default router;
