import express from "express";
import { createStorage } from "./storage.controllers";
import { verifyUser } from "../../../middleware/verifyUsers";

const router = express.Router();

router.get("/create", verifyUser("PARTNER", "ADMIN"), createStorage);

export default router;
