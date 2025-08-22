import express from "express";
import { createCustomerHistoryNote, getAllCustomerHistory, getCustomerHistoryById } from "./customersHistory.controllers";
import { verifyUser } from "../../../middleware/verifyUsers";

const router = express.Router();

router.post("/notizen/:customerId", verifyUser("ADMIN", "PARTNER"), createCustomerHistoryNote);

router.get("/", verifyUser("ADMIN", "PARTNER"), getAllCustomerHistory);

router.get("/:id", verifyUser("ADMIN", "PARTNER"), getCustomerHistoryById);

export default router;