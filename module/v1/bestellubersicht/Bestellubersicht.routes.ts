import express from "express";
import { createBestellubersicht } from "./Bestellubersicht.controllers";
import { verifyUser } from "../../../middleware/verifyUsers";
 

const router = express.Router();

router.post("/",  verifyUser("PARTNER"), createBestellubersicht);

export default router;