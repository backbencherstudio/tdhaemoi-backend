import express from "express";
import { verifyUser } from "../../../middleware/verifyUsers";

import { createOrder, getAllOrders, getOrderById, updateOrderStatus, uploadInvoice, deleteOrder, getOrdersByCustomerId } from "./customerOrders.controllers";
import upload from "../../../config/multer.config";

const router = express.Router();

router.post("/create", verifyUser("ADMIN", "PARTNER"), createOrder );
router.get("/", verifyUser("ADMIN", "PARTNER"), getAllOrders);
router.get("/:id", verifyUser("ADMIN", "PARTNER"), getOrderById);
router.get("/customer/:customerId", verifyUser("ADMIN", "PARTNER"), getOrdersByCustomerId);
router.patch("/status/:id", verifyUser("ADMIN", "PARTNER"), updateOrderStatus);

router.post(
  "/upload-invoice/:orderId",
  verifyUser("ADMIN", "PARTNER"),
  upload.fields([
    { name: "invoice", maxCount: 1 },
  ]),
  uploadInvoice
);

 
router.delete("/:id", verifyUser("ADMIN", "PARTNER"), deleteOrder);

export default router;
