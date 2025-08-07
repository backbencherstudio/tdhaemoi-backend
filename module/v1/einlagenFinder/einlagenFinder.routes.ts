import express from "express";

const router = express.Router();

import { verifyUser } from "../../../middleware/verifyUsers";
import { setEinlagenFinder, getEinlagenFinderAnswers } from "./einlagenFinder.controllers";

router.post("/", verifyUser("PARTNER"), setEinlagenFinder);
router.get("/:customerId", verifyUser("PARTNER"), getEinlagenFinderAnswers);

export default router;
