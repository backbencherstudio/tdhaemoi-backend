import express from "express";
import { verifyUser } from "../../../middleware/verifyUsers";
import { createCustomers } from "./customers.controllers";
import upload from "../../../config/multer.config";

const router = express.Router();

router.post(
  "/",
  verifyUser("PARTNER"),
  upload.fields([
    { name: "picture_10", maxCount: 1 },
    { name: "picture_23", maxCount: 1 },
    { name: "threed_model_left", maxCount: 1 },
    { name: "picture_17", maxCount: 1 },
    { name: "picture_11", maxCount: 1 },
    { name: "picture_24", maxCount: 1 },
    { name: "threed_model_right", maxCount: 1 },
    { name: "picture_16", maxCount: 1 },
    { name: "csvFile", maxCount: 1 }, // CSV upload
  ]),
  createCustomers
);

export default router;
