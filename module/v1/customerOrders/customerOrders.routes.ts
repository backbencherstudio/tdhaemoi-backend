import express from "express";
import { verifyUser } from "../../../middleware/verifyUsers";

import {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  updateMultipleOrderStatuses,
  uploadInvoice,
  uploadInvoiceOnly,
  sendInvoiceToCustomer,
  deleteMultipleOrders,
  deleteOrder,
  getOrdersByCustomerId,
  getLast40DaysOrderStats,
  createWerkstattzettel,
  getEinlagenInProduktion,
} from "./customerOrders.controllers";
import upload from "../../../config/multer.config";

const router = express.Router();

router.get("/einlagen-in-produktion", getEinlagenInProduktion);

router.post("/create", verifyUser("ADMIN", "PARTNER"), createOrder);
router.get("/", verifyUser("ADMIN", "PARTNER"), getAllOrders);
router.get("/:id", verifyUser("ADMIN", "PARTNER"), getOrderById);
router.get(
  "/customer/:customerId",
  verifyUser("ADMIN", "PARTNER"),
  getOrdersByCustomerId
);
router.patch("/status/:id", verifyUser("ADMIN", "PARTNER"), updateOrderStatus);

// Add this route to your router
router.patch(
  "/status/multiple/update",
  verifyUser("ADMIN", "PARTNER"),
  updateMultipleOrderStatuses
);

router.post(
  "/upload-invoice/:orderId",
  verifyUser("ADMIN", "PARTNER"),
  upload.fields([{ name: "invoice", maxCount: 1 }]),
  uploadInvoice
);

router.post(
  "/upload-invoice-only/:orderId",
  verifyUser("ADMIN", "PARTNER"),
  upload.fields([{ name: "invoice", maxCount: 1 }]),
  uploadInvoiceOnly
);

router.post(
  "/send-invoice/:orderId",
  verifyUser("ADMIN", "PARTNER"),
  sendInvoiceToCustomer
);

router.get(
  "/stats/retio",
  verifyUser("ADMIN", "PARTNER"),
  getLast40DaysOrderStats
);

router.delete(
  "/multiple/delete",
  verifyUser("ADMIN", "PARTNER"),
  deleteMultipleOrders
);

router.delete("/:id", verifyUser("ADMIN", "PARTNER"), deleteOrder);

router.post(
  "/werkstattzettel/:customerId",
  verifyUser("ADMIN", "PARTNER"),
  createWerkstattzettel
);



export default router;
