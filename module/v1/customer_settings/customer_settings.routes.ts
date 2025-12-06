import express from "express";
import { verifyUser } from "../../../middleware/verifyUsers";
import {
  getCustomerSettings,
  setCustomerSettings,
  deleteCustomerSettings,
} from "./customer_settings.controllers";

const router = express.Router();

// GET - Get customer settings
router.get("/settings", verifyUser("PARTNER"), getCustomerSettings);

// POST - Create or Update customer settings
router.post("/settings", verifyUser("PARTNER"), setCustomerSettings);

// DELETE - Delete customer settings
router.delete("/settings", verifyUser("PARTNER"), deleteCustomerSettings);

export default router;
