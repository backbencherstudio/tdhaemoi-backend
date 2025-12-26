import express from "express";
import { verifyUser } from "../../../middleware/verifyUsers";
import { manageOrderSettings } from "./order_settings.controllers";


const router = express.Router();

// router.post("/create", verifyUser("ADMIN"), createSoftwareVersion);
 router.get("/manage",verifyUser("ADMIN", "PARTNER"), manageOrderSettings);

export default router;
 