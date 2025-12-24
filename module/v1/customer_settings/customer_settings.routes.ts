import express from "express";
import { verifyUser } from "../../../middleware/verifyUsers";
import {
  getCustomerSettings,
  setCustomerSettings,
  deleteCustomerSettings,
  setStoreLocations,
  getStoreLocations,
  updateStoreLocations,
  deleteStoreLocations,
} from "./customer_settings.controllers";

const router = express.Router();

// GET - Get customer settings
router.get("/settings", verifyUser("PARTNER"), getCustomerSettings);

// POST - Create or Update customer settings
router.post("/settings", verifyUser("PARTNER"), setCustomerSettings);

// DELETE - Delete customer settings
router.delete("/settings", verifyUser("PARTNER"), deleteCustomerSettings);

// POST - Create store location
router.post("/store-locations", verifyUser("PARTNER"), setStoreLocations);

// GET - Get all store locations (with pagination)
router.get("/store-locations", verifyUser("PARTNER"), getStoreLocations);

// PUT - Update store location by ID
router.patch("/store-locations/:id", verifyUser("PARTNER"), updateStoreLocations);

// DELETE - Delete store location by ID
router.delete("/store-locations/:id", verifyUser("PARTNER"), deleteStoreLocations);

export default router;
