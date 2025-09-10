import express from "express";

import { verifyUser } from "../../../middleware/verifyUsers";
import { manageWorkshopNote } from "./workshopNote.controllers";


const router = express.Router();

router.post("/set", verifyUser("PARTNER"), manageWorkshopNote);

export default router;
