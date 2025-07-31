import express from "express";


import { verifyUser } from "../../../middleware/verifyUsers";
import { createVersorgungen, patchVersorgungen } from "./versorgungen.controllers";

const router = express.Router();

router.post("/", verifyUser("PARTNER"), createVersorgungen);
router.patch("/:id", verifyUser("PARTNER"), patchVersorgungen);

export default router;
