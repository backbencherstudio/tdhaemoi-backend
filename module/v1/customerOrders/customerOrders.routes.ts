import express from "express";
import { verifyUser } from "../../../middleware/verifyUsers";

import { createOrder } from "./customerOrders.controllers";

const router = express.Router();

router.post("/create", verifyUser("ADMIN", "PARTNER"), createOrder );

export default router;
