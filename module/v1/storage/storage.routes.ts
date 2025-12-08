import express from "express";
import {
  createStorage,
  deleteStorage,
  getAllMyStorage,
  getSingleStorage,
  updateStorage,
  getStorageChartData,
  getStorageHistory,
  getStoragePerformer,
  getStoreOverviews,
  updateOverviewStatus,
  getStoreOverviewById
} from "./storage.controllers";
import { verifyUser } from "../../../middleware/verifyUsers";

const router = express.Router();

router.post("/create", verifyUser("PARTNER", "ADMIN"), createStorage);
router.get("/my/get", verifyUser("PARTNER", "ADMIN"), getAllMyStorage);
router.get("/get/:id", verifyUser("PARTNER", "ADMIN"), getSingleStorage);
router.patch("/update/:id", verifyUser("PARTNER", "ADMIN"), updateStorage);
router.delete("/delete/:id", verifyUser("PARTNER", "ADMIN"), deleteStorage);
router.get("/chart-data", verifyUser("PARTNER", "ADMIN"), getStorageChartData);
router.get("/history/:id", verifyUser("PARTNER", "ADMIN"), getStorageHistory);
router.get("/performer", verifyUser("PARTNER", "ADMIN"), getStoragePerformer);
//store overviwe
router.get("/store-overview", verifyUser("PARTNER", "ADMIN"), getStoreOverviews);
router.patch("/update-overview-statu", verifyUser("PARTNER", "ADMIN"), updateOverviewStatus);
router.get("/get-store-overview-by-id/:id", verifyUser("PARTNER", "ADMIN"), getStoreOverviewById);

export default router;