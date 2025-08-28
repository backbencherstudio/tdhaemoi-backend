import express from "express";
import { verifyUser } from "../../../middleware/verifyUsers";

import { createOrder, getAllOrders, getOrderById, updateOrderStatus } from "./customerOrders.controllers";

const router = express.Router();

router.post("/create", verifyUser("ADMIN", "PARTNER"), createOrder );
router.get("/", verifyUser("ADMIN", "PARTNER"), getAllOrders);
router.get("/:id", verifyUser("ADMIN", "PARTNER"), getOrderById);
router.patch("/status/:id", verifyUser("ADMIN", "PARTNER"), updateOrderStatus);



export default router;
