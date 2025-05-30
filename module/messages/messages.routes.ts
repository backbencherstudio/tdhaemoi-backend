import express from "express";
import { createMessage } from "./messages.controllers";
import { verifyUser } from "../../middleware/verifyUsers";

const router = express.Router();

router.post("/", verifyUser("PARTNER", "ADMIN"), createMessage);

export default router;