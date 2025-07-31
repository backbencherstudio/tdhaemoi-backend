import express from "express";


import { verifyUser } from "../../../middleware/verifyUsers";
import { createVersorgungen } from "./versorgungen.controllers";

const router = express.Router();

router.post("/", verifyUser("PARTNER"), createVersorgungen);


export default router;
