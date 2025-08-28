import express from "express";
import { verifyUser } from "../../../middleware/verifyUsers";

import { createOrder, getAllOrders } from "./customerOrders.controllers";

const router = express.Router();

router.post("/create", verifyUser("ADMIN", "PARTNER"), createOrder );
router.get("/", verifyUser("ADMIN", "PARTNER"), getAllOrders);

export default router;
