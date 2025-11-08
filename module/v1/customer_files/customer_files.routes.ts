import express from "express";
import { verifyUser } from "../../../middleware/verifyUsers";
import {
  createCustomerFile,
  deleteCustomerFile,
  getCustomerFiles,
  updateCustomerFile,
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

router.put(
  "/update",
  verifyUser("PARTNER", "ADMIN"),
  upload.fields([{ name: "image", maxCount: 1 }]),
  updateCustomerFile
);

router.delete("/delete", verifyUser("PARTNER", "ADMIN"), deleteCustomerFile);

export default router;
