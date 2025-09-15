import express from "express";

import { verifyUser } from "../../../middleware/verifyUsers";
import { getWorkshopNote, manageWorkshopNote } from "./workshopNote.controllers";


const router = express.Router();

router.post("/set", verifyUser("PARTNER"), manageWorkshopNote);
router.get("/get", verifyUser("PARTNER"), getWorkshopNote);


export default router;
