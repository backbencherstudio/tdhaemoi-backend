import express from "express";
import {
  createBestellubersicht,
  getBestellubersicht,
} from "./Bestellubersicht.controllers";
import { verifyUser } from "../../../middleware/verifyUsers";

const router = express.Router();

router.post("/", verifyUser("PARTNER"), createBestellubersicht);

router.get("/", verifyUser("PARTNER"), getBestellubersicht);

export default router;
